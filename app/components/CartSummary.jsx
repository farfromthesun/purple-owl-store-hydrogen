import {CartForm, Money} from '@shopify/hydrogen';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  // const className =
  //   layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <div
      aria-labelledby="cart-summary"
      className={classNames(
        layout === 'aside' && 'border-t border-gray-200 px-4 py-6 sm:px-6',
        layout === 'page' &&
          'border-t border-gray-200 lg:border-none py-6 lg:py-4 mt-6 lg:mt-0 lg:col-span-1 sticky top-[84px]',
        '',
      )}
    >
      <div className="flex justify-between text-base font-medium text-gray-900">
        <div>Subtotal</div>
        <div>
          {cart.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </div>
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
