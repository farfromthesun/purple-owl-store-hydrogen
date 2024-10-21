import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import {TrashIcon} from '@heroicons/react/24/outline';
import {PlusIcon, MinusIcon} from '@heroicons/react/16/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * @param {{
 *   layout: CartLayout;
 *   line: CartLine;
 * }}
 */
export function CartLineItem({layout, line}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  return (
    <>
      <li key={id} className="flex py-6">
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
          {image && (
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={100}
              loading="lazy"
              width={100}
              className="h-full w-full object-cover object-center"
            />
          )}
        </div>

        <div className="ml-4 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between text-base font-medium text-gray-900">
              <h3>
                <Link
                  prefetch="intent"
                  to={lineItemUrl}
                  onClick={() => {
                    if (layout === 'aside') {
                      close();
                    }
                  }}
                >
                  <p>
                    <strong>{product.title}</strong>
                  </p>
                </Link>
              </h3>
              <div className="ml-4">
                <ProductPrice price={line?.cost?.totalAmount} />
              </div>
            </div>
            {!line.merchandise.product.options?.find(
              (option) => option.name === 'Title',
            ) ? (
              <ul>
                {selectedOptions.map((option) => (
                  <li key={option.name}>
                    <small className="mt-1 text-sm text-gray-500">
                      {option.name}: {option.value}
                    </small>
                  </li>
                ))}
                {line.attributes?.map((attribute) => (
                  <li key={attribute.key}>
                    <small className="mt-1 text-sm text-gray-500">
                      {attribute.key}: {attribute.value}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              ''
            )}
          </div>
          <CartLineQuantity line={line} />
        </div>
      </li>

      {/* <li key={id} className="cart-line">
        {image && (
          <Image
            alt={title}
            aspectRatio="1/1"
            data={image}
            height={100}
            loading="lazy"
            width={100}
          />
        )}

        <div>
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
          >
            <p>
              <strong>{product.title}</strong>
            </p>
          </Link>
          <ProductPrice price={line?.cost?.totalAmount} />
          <ul>
            {selectedOptions.map((option) => (
              <li key={option.name}>
                <small>
                  {option.name}: {option.value}
                </small>
              </li>
            ))}
          </ul>
          <CartLineQuantity line={line} />
        </div>
      </li> */}
    </>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 * @param {{line: CartLine}}
 */
function CartLineQuantity({line}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <>
      {/* <div className="flex flex-1 items-end justify-between text-sm"> */}
      {/* <p className="text-gray-500">Qty {product.quantity}</p> */}

      {/* <div className="flex">
          <button
            type="button"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Remove
          </button>
        </div> */}
      {/* </div> */}

      <div
        className={classNames(
          line.merchandise.product.tags?.includes('GWP')
            ? 'justify-end'
            : 'justify-between',
          'flex flex-1 items-end text-sm items-center mt-2',
        )}
      >
        {!line.merchandise.product.tags?.includes('GWP') ? (
          <div className="gap-2 flex">
            <CartLineUpdateButton
              lines={[{id: lineId, quantity: prevQuantity}]}
            >
              <input type="hidden" name="updateType" value="decrease" />
              <button
                className={classNames(
                  quantity > 1
                    ? 'cursor-pointer bg-white text-gray-900 shadow-sm'
                    : 'cursor-not-allowed bg-gray-50 text-gray-200',
                  'group relative flex h-full items-center justify-center rounded-md border border-gray-200 px-2 py-1 text-sm font-medium capitalize hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-purple transition duration-200',
                )}
                aria-label="Decrease quantity"
                disabled={quantity <= 1 || !!isOptimistic}
                name="decrease-quantity"
                value={prevQuantity}
              >
                <span>
                  <MinusIcon aria-hidden="true" className="h-3 w-3" />
                </span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    quantity > 1 ? 'opacity-100' : 'opacity-0',
                    'pointer-events-none absolute -inset-px rounded-md border-2 border-transparent transition duration-200 lg:group-hover:border-main-purple',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={classNames(
                    quantity <= 1 ? 'opacity-100' : 'opacity-0',
                    'pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200 transition duration-200',
                  )}
                >
                  <svg
                    stroke="currentColor"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full stroke-3 text-gray-200 transition duration-200"
                  >
                    <line
                      x1={0}
                      x2={100}
                      y1={100}
                      y2={0}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </span>
              </button>
            </CartLineUpdateButton>
            <div className="w-7 text-center px-2 py-1 rounded-md text-xs text-gray-500 outline-none">
              {quantity}
            </div>
            <CartLineUpdateButton
              lines={[{id: lineId, quantity: nextQuantity}]}
            >
              <input type="hidden" name="updateType" value="increase" />
              <button
                className="group relative flex h-full items-center justify-center rounded-md border border-gray-200 px-2 py-1 text-sm font-medium capitalize hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-purple transition duration-200 cursor-pointer bg-white text-gray-900 shadow-sm"
                aria-label="Increase quantity"
                name="increase-quantity"
                value={nextQuantity}
                disabled={!!isOptimistic}
              >
                <span>
                  <PlusIcon aria-hidden="true" className="h-3 w-3" />
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-px rounded-md border-2 border-transparent transition duration-200 lg:group-hover:border-main-purple"
                />
              </button>
            </CartLineUpdateButton>
          </div>
        ) : (
          ''
        )}

        <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
      </div>
    </>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 * @param {{
 *   lineIds: string[];
 *   disabled: boolean;
 * }}
 */
function CartLineRemoveButton({lineIds, disabled}) {
  return (
    <div className="flex">
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesRemove}
        inputs={{lineIds}}
      >
        <button
          disabled={disabled}
          type="submit"
          className="cursor-pointer text-main-purple lg:hover:text-main-purple-dark transition duration-300"
        >
          <TrashIcon aria-hidden="true" className="h-5 w-5" />
        </button>
      </CartForm>
    </div>
  );
}

/**
 * @param {{
 *   children: React.ReactNode;
 *   lines: CartLineUpdateInput[];
 * }}
 */
function CartLineUpdateButton({children, lines}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */

/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
