import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 * @param {CartMainProps}
 */
export function CartMain({layout, cart: originalCart}) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  // const cart = useOptimisticCart(originalCart);
  const cart = originalCart;
  const {close} = useAside();
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  // const withDiscount =
  //   cart &&
  //   Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  // const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;

  return (
    <>
      <CartEmpty hidden={linesCount} layout={layout} close={close} />
      <div
        hidden={!linesCount}
        className={classNames(
          layout === 'aside' && 'mt-2 flex-1 overflow-y-auto px-4 pb-6 sm:px-6',
          layout === 'page' && 'lg:col-span-2',
        )}
      >
        <ul className="-my-6 divide-y divide-gray-200">
          {(cart?.lines?.nodes ?? []).map((line) => (
            <CartLineItem key={line.id} line={line} layout={layout} />
          ))}
        </ul>

        {/* <ul>
            {(cart?.lines?.nodes ?? []).map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </ul> */}
      </div>
    </>
  );
}

/**
 * @param {{
 *   hidden: boolean;
 *   layout?: CartMainProps['layout'];
 * }}
 */
function CartEmpty({hidden = false, layout, close}) {
  return (
    <div
      hidden={hidden}
      className={classNames(
        layout === 'aside' && 'mt-2 pb-6 flex-1 px-4 sm:px-6 overflow-y-auto',
        layout === 'page' && 'pb-6 lg:col-span-2',
      )}
    >
      <p className="my-6">
        {/* Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started! */}
        Looks like you haven&rsquo;t added anything yet!
      </p>
      {layout === 'aside' && (
        <button className="button" onClick={close}>
          Close
        </button>
      )}
      {layout === 'page' && (
        <Link
          to="/collections/all-products"
          onClick={close}
          prefetch="viewport"
          className="button"
        >
          Continue shopping →
        </Link>
      )}
    </div>
  );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
