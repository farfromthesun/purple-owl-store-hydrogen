import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link, useFetcher} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import {TrashIcon} from '@heroicons/react/20/outline';
import {PlusIcon, MinusIcon} from '@heroicons/react/16/solid';
import {AnimatePresence, motion} from 'framer-motion';

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

  const cartLineFetchers = [
    useFetcher({key: 'cartLineUpdateFetcher'}),
    useFetcher({key: 'cartLineRemoveFetcher'}),
  ];

  function cartLineFetcherCheck(fetcher) {
    if (fetcher.state !== 'idle' && fetcher.formData) {
      const formInputs = CartForm.getFormInput(fetcher.formData);
      if (formInputs.inputs?.lines?.length) {
        return formInputs.inputs.lines[0].id === id ? true : false;
      } else if (formInputs.inputs?.lineIds?.length) {
        return formInputs.inputs.lineIds[0] === id ? true : false;
      }
    }
    return false;
  }

  function cartLineFetcherErrorsCheck(fetcher) {
    return fetcher?.data?.inputLines?.some((line) => line.id === id) &&
      fetcher?.state === 'idle' &&
      fetcher?.data?.errors.length > 0
      ? true
      : false;
  }

  const currentCartLineFetcher = cartLineFetchers.filter((fetcher) =>
    cartLineFetcherCheck(fetcher),
  );
  const currentCartLineActionFetcherPending = currentCartLineFetcher.length > 0;
  const [currentCartLineErrors] = cartLineFetchers
    .filter((fetcher) => cartLineFetcherErrorsCheck(fetcher))
    .map((fetcher) => fetcher.data.errors);

  return (
    <>
      <li
        key={id}
        className={classNames(layout === 'page' && 'lg:py-10', 'flex py-6')}
      >
        <div
          className={classNames(
            layout === 'page' && 'lg:h-48 lg:w-48',
            'h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200',
          )}
        >
          {image && (
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={layout === 'page' ? 200 : 100}
              loading="lazy"
              width={layout === 'page' ? 200 : 100}
              className="h-full w-full object-cover object-center bg-main-purple/15"
            />
          )}
        </div>

        <div
          className={classNames(
            layout === 'page' && 'ml-6',
            'ml-4 flex flex-1 flex-col justify-between',
          )}
        >
          <div>
            <div className="flex justify-between text-base font-medium text-gray-900">
              <h3
                className={classNames(
                  layout === 'page' && 'lg:max-w-full',
                  'max-w-36 lg:max-w-48',
                )}
              >
                <Link
                  prefetch="intent"
                  to={lineItemUrl}
                  onClick={() => {
                    if (layout === 'aside') {
                      close();
                    }
                  }}
                  className="hover:text-main-purple transition duration-300"
                >
                  <strong>{product.title}</strong>
                </Link>
              </h3>
              <div className="">
                <AnimatePresence
                  mode="wait"
                  initial={false}
                  key="lineItemTotalAmount"
                >
                  <motion.div
                    key={
                      currentCartLineActionFetcherPending
                        ? 'Processing...'
                        : line?.cost?.totalAmount
                    }
                    initial={{x: 20, opacity: 0}}
                    animate={{x: 0, opacity: 1}}
                    exit={{x: -20, opacity: 0}}
                    transition={{duration: 0.2, ease: 'backInOut'}}
                    className="h-6 flex items-center"
                  >
                    {currentCartLineActionFetcherPending ? (
                      <div className="text-xs animate-pulse">Processing...</div>
                    ) : (
                      <ProductPrice price={line?.cost?.totalAmount} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            {!line.merchandise.selectedOptions.find(
              (option) =>
                option.name === 'Title' && option.value === 'Default Title',
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
          <CartLineQuantity
            line={line}
            layout={layout}
            disabledByAction={currentCartLineActionFetcherPending}
            fetcherErrors={currentCartLineErrors}
          />
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
function CartLineQuantity({line, layout, disabledByAction, fetcherErrors}) {
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
          'flex items-end text-sm mt-2 flex-wrap',
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
                  quantity <= 1 || disabledByAction
                    ? 'cursor-not-allowed bg-gray-50 text-gray-200'
                    : 'cursor-pointer bg-white text-gray-900 shadow-sm',
                  'group relative flex h-full items-center justify-center rounded-md border border-gray-200 px-2 py-2 text-sm font-medium capitalize hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-purple transition duration-200',
                )}
                aria-label="Decrease quantity"
                disabled={quantity <= 1 || !!isOptimistic || disabledByAction}
                name="decrease-quantity"
                value={prevQuantity}
              >
                <span>
                  <MinusIcon aria-hidden="true" className="h-4 w-4" />
                </span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    quantity <= 1 || disabledByAction
                      ? 'opacity-0'
                      : 'opacity-100',
                    'pointer-events-none absolute -inset-px rounded-md border-2 border-transparent transition duration-200 lg:group-hover:border-main-purple',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={classNames(
                    quantity <= 1 || disabledByAction
                      ? 'opacity-100'
                      : 'opacity-0',
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
            <div className="flex items-center justify-center w-7 text-center px-2 rounded-md text-sm text-gray-500 outline-none">
              {quantity}
            </div>
            <CartLineUpdateButton
              lines={[{id: lineId, quantity: nextQuantity}]}
            >
              <input type="hidden" name="updateType" value="increase" />
              <button
                className={classNames(
                  disabledByAction
                    ? 'cursor-not-allowed bg-gray-50 text-gray-200'
                    : 'cursor-pointer bg-white text-gray-900 shadow-sm',
                  'group relative flex h-full items-center justify-center rounded-md border border-gray-200 px-2 py-2 text-sm font-medium capitalize hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-purple transition duration-200',
                )}
                aria-label="Increase quantity"
                name="increase-quantity"
                value={nextQuantity}
                disabled={!!isOptimistic || disabledByAction}
              >
                <span>
                  <PlusIcon aria-hidden="true" className="h-4 w-4" />
                </span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    disabledByAction ? 'opacity-0' : 'opacity-100',
                    'pointer-events-none absolute -inset-px rounded-md border-2 border-transparent transition duration-200 lg:group-hover:border-main-purple',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={classNames(
                    disabledByAction ? 'opacity-100' : 'opacity-0',
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
          </div>
        ) : (
          ''
        )}

        <CartLineRemoveButton
          lineIds={[lineId]}
          disabled={!!isOptimistic || disabledByAction}
        />
        {fetcherErrors && (
          <div className="basis-full">
            {fetcherErrors.map((error) => (
              <span
                className="block mt-2 text-red-700 text-xs animate-fade-in"
                key={error.message}
              >
                {error.message}
              </span>
            ))}
          </div>
        )}
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
        fetcherKey="cartLineRemoveFetcher"
      >
        <button
          disabled={disabled}
          type="submit"
          className="cursor-pointer text-main-purple lg:hover:text-main-purple-dark transition duration-300 disabled:text-gray-400 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
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
      fetcherKey="cartLineUpdateFetcher"
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
