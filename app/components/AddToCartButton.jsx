import {useFetcher} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';
import {AnimatePresence, motion} from 'framer-motion';
import {useEffect, useState} from 'react';

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
}) {
  const [atcSuccessState, setAtcSuccessState] = useState(false);
  const atcFetcher = useFetcher({key: 'addToCartFetcher'});

  useEffect(() => {
    if (atcFetcher.state === 'idle' && atcFetcher.data?.errors?.length === 0) {
      setAtcSuccessState(true);
      setTimeout(() => {
        setAtcSuccessState(false);
      }, 1000);
    }
  }, [atcFetcher.state, atcFetcher.data?.errors?.length]);

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
            <button
              type="submit"
              // onClick={onClick}
              disabled={atcDisable || atcSuccessState}
              className={classNames(
                atcDisable && 'bg-gray-400 cursor-not-allowed',
                atcSuccessState && 'bg-green-600 cursor-not-allowed',
                'button w-full mt-5',
              )}
            >
              <AnimatePresence mode="wait" initial={false} key="atcButton">
                <motion.span
                  key={
                    fetcher.state !== 'idle'
                      ? 'Processing...'
                      : atcSuccessState
                      ? 'success'
                      : children
                  }
                  initial={{x: 20, opacity: 0}}
                  animate={{x: 0, opacity: 1}}
                  exit={{x: -20, opacity: 0}}
                  transition={{duration: 0.2, ease: 'backInOut'}}
                  className="block"
                >
                  {fetcher.state !== 'idle'
                    ? 'Processing...'
                    : atcSuccessState
                    ? 'Done!'
                    : children}
                </motion.span>
              </AnimatePresence>
            </button>
            {fetcher.state === 'idle' &&
              fetcher.data?.errors?.length > 0 &&
              fetcher.data.errors.map((error) => (
                <span
                  className="block mt-2 text-red-700 text-xs text-center animate-fade-in"
                  key={error.message}
                >
                  {error.message}
                </span>
              ))}
          </>
        );
      }}
    </CartForm>
  );
}

/** @typedef {import('@remix-run/react').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
