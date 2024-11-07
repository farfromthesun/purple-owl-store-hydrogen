import {Await, useRouteLoaderData} from '@remix-run/react';
import {Suspense} from 'react';
import {CartForm, getSeoMeta} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';
import {RouteTransition} from '~/components/RouteTransition';
import {CartSummary} from '~/components/CartSummary';
import {seoPayload} from '~/lib/seo.server';
import {Description} from '@headlessui/react';

// /**
//  * @type {MetaFunction}
//  */
// export const meta = () => {
//   return [{title: `Cart | Purple Owl Store`}];
// };

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  const errors = [];

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

  if (result.userErrors.length > 0) errors.push(result.userErrors[0]);

  // if (errors.length <= 0) {
  if (initialCart?.totalQuantity !== result.cart.totalQuantity) {
    const newCart = await cart.get();
    const isEligibleForGwp = newCart.cost.totalAmount.amount > 50;
    const gwpLineToAdd = [
      {
        merchandiseId: 'gid://shopify/ProductVariant/' + gwpVariantID,
        quantity: 1,
      },
    ];
    const gwpLineToRemove = [gwpInCart?.id];

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
    //       result = await cart.removeLines(gwpLineToRemove);
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
            result = await cart.removeLines(gwpLineToRemove);
          }
        }
        break;
      case 'LinesRemove':
        if (!isEligibleForGwp && gwpInCart && !isRemoveOnGwp) {
          result = await cart.removeLines(gwpLineToRemove);
        }
        break;
    }

    if (
      result.userErrors.length > 0 &&
      !errors.some((error) => error.message === result.userErrors[0].message)
    )
      errors.push(result.userErrors[0]);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, userErrors} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return json(
    {
      inputLines: inputs.lines,
      cart: cartResult,
      // errors: userErrors,
      errors,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({request, context}) {
  const [{shop}] = await Promise.all([
    context.storefront.query(SHOP_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);
  const url = request.url;

  return {
    seo: seoPayload.page({
      shop,
      page: {
        title: 'Your cart',
      },
      url,
    }),
  };
}

export const meta = ({matches}) => {
  return getSeoMeta(...matches.map((match) => match.data?.seo));
};

export default function Cart() {
  /** @type {RootLoader} */
  const rootData = useRouteLoaderData('root');
  if (!rootData) return null;

  return (
    <RouteTransition>
      <div className="cart mx-auto max-w-2xl lg:max-w-1400 px-4 pt-12 pb-16 sm:px-6 lg:px-8 lg:pt-20 lg:pb-28">
        <h1 className="text-3xl font-semibold sm:text-4xl pb-12">Your cart</h1>
        <Suspense fallback={<p>Loading cart ...</p>}>
          <Await
            resolve={rootData.cart}
            errorElement={<div>An error occurred</div>}
          >
            {(cart) => {
              const cartHasItems = cart?.totalQuantity > 0;
              return (
                <div className="lg:grid lg:grid-cols-3 lg:gap-x-20 xl:gap-x-24 items-start">
                  <CartMain cart={cart} layout="page" />
                  {cartHasItems && <CartSummary cart={cart} layout="page" />}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </RouteTransition>
  );
}

export const SHOP_QUERY = `#graphql
  query Shop(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    shop {
      name
      description
    }
  }
`;

/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('~/root').RootLoader} RootLoader */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
