import {CartForm} from '@shopify/hydrogen';
import {useAside} from './Aside';
import {AnimatePresence, easeInOut, motion} from 'framer-motion';

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
  const {open} = useAside();

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => {
        const atcDisable = disabled || fetcher.state !== 'idle';
        // console.log('fetcher', fetcher);
        if (fetcher.state === 'loading' && fetcher.data?.errors?.length === 0)
          open('cart');

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
              disabled={atcDisable}
              className={`button w-full mt-5 ${
                atcDisable ? 'bg-gray-400 cursor-not-allowed' : ''
              }`}
            >
              <AnimatePresence mode="wait" initial={false} key="atcButton">
                <motion.span
                  key={fetcher.state !== 'idle' ? 'Processing...' : children}
                  initial={{x: 20, opacity: 0}}
                  animate={{x: 0, opacity: 1}}
                  exit={{x: -20, opacity: 0}}
                  transition={{duration: 0.2, ease: 'backInOut'}}
                  className="block"
                >
                  {fetcher.state !== 'idle' ? 'Processing...' : children}
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
