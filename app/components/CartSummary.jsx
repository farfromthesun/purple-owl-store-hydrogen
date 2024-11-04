import {useFetchers} from '@remix-run/react';
import {CartForm, Money} from '@shopify/hydrogen';
import {AnimatePresence, motion} from 'framer-motion';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  // const className =
  //   layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  const fetchers = useFetchers();
  const cartActionFetcher = fetchers.find((fetcher) => {
    if (fetcher.formData) {
      const formInputs = CartForm.getFormInput(fetcher.formData);
      if (
        (formInputs.action === CartForm.ACTIONS.LinesUpdate ||
          formInputs.action === CartForm.ACTIONS.LinesRemove) &&
        fetcher.state !== 'idle'
      ) {
        return fetcher;
      }
    }
    return null;
  });

  return (
    <div
      aria-labelledby="cart-summary"
      className={classNames(
        layout === 'aside' && 'border-t border-gray-200 px-4 py-6 sm:px-6',
        layout === 'page' &&
          'px-4 py-6 lg:px-6 lg:py-8 bg-main-purple/05 rounded-lg mt-12 lg:mt-0 lg:col-span-1 sticky top-main-header-desktop-height',
        '',
      )}
    >
      <div className="flex justify-between text-base font-medium text-gray-900">
        <div>Subtotal</div>
        <AnimatePresence
          mode="wait"
          initial={false}
          key="cartSummarySubtotalAmount"
        >
          <motion.div
            key={
              cartActionFetcher ? 'Processing...' : cart.cost?.subtotalAmount
            }
            initial={{x: 20, opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: -20, opacity: 0}}
            transition={{duration: 0.2, ease: 'backInOut'}}
            className="h-6 flex items-center"
          >
            {cartActionFetcher ? (
              <div className="text-sm animate-pulse">Processing...</div>
            ) : cart.cost?.subtotalAmount?.amount ? (
              <div className="">
                <Money data={cart.cost?.subtotalAmount} />
              </div>
            ) : (
              '-'
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-0.5 text-sm text-gray-500">
        Shipping and taxes calculated at checkout.
      </p>
      {/* <CartDiscounts discountCodes={cart.discountCodes} /> */}
      {/* <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Total</p>
          <p>
            {cart.cost?.totalAmount?.amount ? (
              <Money data={cart.cost?.totalAmount} />
            ) : (
              '-'
            )}
          </p>
        </div> */}

      <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
    </div>
  );
}
/**
 * @param {{checkoutUrl?: string}}
 */
function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <div className="mt-6">
      <a href={checkoutUrl} target="_self" className="button w-full">
        Checkout
      </a>
    </div>
  );
}

/**
 * @param {{
 *   discountCodes?: CartApiQueryFragment['discountCodes'];
 * }}
 */
function CartDiscounts({discountCodes}) {
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button>Remove</button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <input type="text" name="discountCode" placeholder="Discount code" />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

/**
 * @param {{
 *   discountCodes?: string[];
 *   children: React.ReactNode;
 * }}
 */
function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
