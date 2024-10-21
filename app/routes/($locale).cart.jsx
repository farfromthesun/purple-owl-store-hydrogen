import {Await, useRouteLoaderData} from '@remix-run/react';
import {Suspense} from 'react';
import {CartForm} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';
import {RouteTransition} from '~/components/RouteTransition';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: `Cart | Purple Owl Store`}];
};

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  const initialCart = await cart.get();
  const gwpVariantID = 48342561653045;
  const gwpInCart = initialCart?.lines?.nodes.find((node) =>
    node.merchandise.id.includes(gwpVariantID),
  );
  const isRemoveOnGwp = inputs?.lineIds?.includes(gwpInCart?.id);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const newCart = await cart.get();
  const isEligibleForGwp = newCart.cost.totalAmount.amount > 50;
  const gwpLineToAdd = [
    {
      merchandiseId: 'gid://shopify/ProductVariant/' + gwpVariantID,
      quantity: 1,
    },
  ];
  const gwpLineToARemove = [gwpInCart?.id];

  // if (
  //   action === 'LinesAdd' ||
  //   action === 'LinesUpdate' ||
  //   (action === 'LinesRemove' && !isRemoveOnGwp)
  // ) {
  //   if (isEligibleForGwp) {
  //     if (!gwpInCart && inputs?.updateType === 'increase') {
  //       result = await cart.addLines(gwpLineToAdd);
  //     }
  //   } else {
  //     if (gwpInCart) {
  //       result = await cart.removeLines(gwpLineToARemove);
  //     }
  //   }
  // }

  switch (action) {
    case 'LinesAdd':
      if (isEligibleForGwp && !gwpInCart) {
        result = await cart.addLines(gwpLineToAdd);
      }
      break;
    case 'LinesUpdate':
      if (isEligibleForGwp) {
        if (!gwpInCart && inputs?.updateType === 'increase') {
          result = await cart.addLines(gwpLineToAdd);
        }
      } else {
        if (gwpInCart) {
          result = await cart.removeLines(gwpLineToARemove);
        }
      }
      break;
    case 'LinesRemove':
      if (!isEligibleForGwp && gwpInCart && !isRemoveOnGwp) {
        result = await cart.removeLines(gwpLineToARemove);
      }
      break;
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return json(
    {
      cart: cartResult,
      errors,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export default function Cart() {
  /** @type {RootLoader} */
  const rootData = useRouteLoaderData('root');
  if (!rootData) return null;

  return (
    <RouteTransition>
      <div className="cart p-6 lg:px-8">
        <h1>Cart</h1>
        <Suspense fallback={<p>Loading cart ...</p>}>
          <Await
            resolve={rootData.cart}
            errorElement={<div>An error occurred</div>}
          >
            {(cart) => {
              return <CartMain layout="page" cart={cart} />;
            }}
          </Await>
        </Suspense>
      </div>
    </RouteTransition>
  );
}

/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('~/root').RootLoader} RootLoader */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
