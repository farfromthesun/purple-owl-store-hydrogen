import {useFetcher} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';
import {AnimatePresence, motion} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   disabled?: boolean;
 *   lines: Array<OptimisticCartLineInput>;
 *   onClick?: () => void;
 * }}
 */
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  selectedVariant,
}) {
  const atcFetcher = useFetcher({key: 'addToCartFetcher'});
  const [atcFetcherStatus, setAtcFetcherStatus] = useState({
    currentActionStatus: null,
    actionPerformed: false,
  });
  const errorMessagesContainerRef = useRef(null);
  const prevVariantRef = useRef(selectedVariant);
  const [showErrors, setShowErrors] = useState(false);

  // const errorMessagesCleanup = () => {
  //   if (errorMessagesContainerRef.current) {
  //     errorMessagesContainerRef.current.innerHTML = '';
  //   }
  // };

  // useEffect(() => {
  //   errorMessagesCleanup();
  // }, []);

  useEffect(() => {
    if (prevVariantRef.current.title !== selectedVariant.title) {
      setShowErrors(false);
      prevVariantRef.current = selectedVariant;
    }
  }, [selectedVariant]);

  useEffect(() => {
    if (atcFetcher.state !== 'idle')
      setAtcFetcherStatus((prevState) => ({
        ...prevState,
        actionPerformed: true,
      }));
  }, [atcFetcher.state]);

  useEffect(() => {
    let timeoutId;

    if (atcFetcher.state === 'idle' && atcFetcherStatus.actionPerformed) {
      let atcStatus;
      atcFetcher.data?.errors?.length === 0
        ? (atcStatus = 'success')
        : atcFetcher.data?.warning
        ? (atcStatus = 'warning')
        : (atcStatus = 'failure');

      atcFetcher.data?.errors?.length !== 0 && setShowErrors(true);

      setAtcFetcherStatus((prevState) => ({
        ...prevState,
        currentActionStatus: atcStatus,
      }));

      timeoutId = setTimeout(() => {
        setAtcFetcherStatus((prevState) => ({
          ...prevState,
          currentActionStatus: null,
          actionPerformed: false,
        }));
      }, 1000);

      // Cleanup function to prevent memory leaks
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  }, [
    atcFetcher.state,
    atcFetcher.data?.errors?.length,
    atcFetcherStatus.actionPerformed,
    atcFetcher.data?.warning,
  ]);

  return (
    <CartForm
      route="/cart"
      inputs={{lines}}
      action={CartForm.ACTIONS.LinesAdd}
      fetcherKey="addToCartFetcher"
    >
      {(fetcher) => {
        const atcDisable = disabled || fetcher.state !== 'idle';

        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <motion.button
              layout
              transition={{duration: 0.2, ease: 'easeInOut'}}
              type="submit"
              // onClick={onClick}
              disabled={
                atcDisable || atcFetcherStatus.currentActionStatus !== null
              }
              className={classNames(
                atcDisable && 'bg-gray-400 cursor-not-allowed',
                atcFetcherStatus.currentActionStatus === 'success' &&
                  'bg-green-600 cursor-not-allowed',
                atcFetcherStatus.currentActionStatus === 'failure' &&
                  'bg-red-600 cursor-not-allowed',
                atcFetcherStatus.currentActionStatus === 'warning' &&
                  'bg-orange-600 cursor-not-allowed',
                'button w-full mt-5 mb-2',
              )}
            >
              <AnimatePresence mode="popLayout" initial={false} key="atcButton">
                <motion.span
                  key={
                    fetcher.state !== 'idle'
                      ? 'Processing...'
                      : atcFetcherStatus.currentActionStatus === 'success'
                      ? 'success'
                      : atcFetcherStatus.currentActionStatus === 'failure'
                      ? 'failure'
                      : atcFetcherStatus.currentActionStatus === 'warning'
                      ? 'warning'
                      : children
                  }
                  initial={{x: 20, opacity: 0}}
                  animate={{x: 0, opacity: 1}}
                  exit={{x: -20, opacity: 0}}
                  // transition={{duration: 0.2, ease: 'backInOut'}}
                  transition={{duration: 0.2, ease: 'easeOut'}}
                  className="block"
                >
                  {fetcher.state !== 'idle'
                    ? 'Processing...'
                    : atcFetcherStatus.currentActionStatus === 'success'
                    ? 'Done!'
                    : atcFetcherStatus.currentActionStatus === 'failure'
                    ? 'Failed!'
                    : atcFetcherStatus.currentActionStatus === 'warning'
                    ? 'Warning!'
                    : children}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <AnimatePresence>
              {fetcher.state === 'idle' &&
                fetcher.data?.errors?.length > 0 &&
                showErrors &&
                fetcher.data.errors.map((error) => (
                  <motion.span
                    initial={{opacity: 0, filter: 'blur(2px)', height: 0}}
                    animate={{opacity: 1, filter: 'blur(0)', height: 'auto'}}
                    exit={{opacity: 0, filter: 'blur(2px)', height: 0}}
                    transition={{
                      default: {duration: 0.2, ease: 'easeOut'},
                      layout: {duration: 0.2, ease: 'easeInOut'},
                    }}
                    layout
                    className="block text-red-700 text-xs text-center"
                    key={error.message}
                    ref={errorMessagesContainerRef}
                  >
                    {error.message}
                  </motion.span>
                ))}
            </AnimatePresence>
          </>
        );
      }}
    </CartForm>
  );
}

/** @typedef {import('@remix-run/react').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
