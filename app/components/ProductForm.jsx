import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import {PlusIcon, MinusIcon} from '@heroicons/react/16/solid';
import {Await, Link, useRouteLoaderData} from '@remix-run/react';
import {VariantSelector} from '@shopify/hydrogen';
import {Suspense, useCallback, useEffect, useState} from 'react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * @param {{
 *   product: ProductFragment;
 *   selectedVariant: ProductFragment['selectedVariant'];
 *   variants: Array<ProductVariantFragment>;
 * }}
 */
export function ProductForm({product, selectedVariant, variants}) {
  const {open} = useAside();
  const [variantQuantity, setVariantQuantity] = useState(1);

  const variantQuantityDecrement = () => {
    if (variantQuantity === 1) return;
    setVariantQuantity(variantQuantity - 1);
  };
  const variantQuantityIncrement = () => {
    setVariantQuantity(variantQuantity + 1);
  };

  return (
    <div className="product-form mt-10">
      <p>{JSON.stringify(selectedVariant.order_limit_metafield)}</p>
      <VariantSelector
        handle={product.handle}
        options={product.options.filter((option) => option.values.length > 1)}
        variants={variants}
      >
        {({option}) => <ProductOptions key={option.name} option={option} />}
      </VariantSelector>
      <QuantitySelector
        quantity={variantQuantity}
        handleDecrement={variantQuantityDecrement}
        handleIncrement={variantQuantityIncrement}
        selectedVariant={selectedVariant}
      />
      {selectedVariant.availableForSale &&
        (selectedVariant.order_limit_metafield ||
          selectedVariant.quantityAvailable > 0) && (
          <p className="text-main-purple text-sm font-medium mt-3 mb-3 animate-fade-in flex items-center gap-1">
            Only{' '}
            <span className="badge">
              {selectedVariant.order_limit_metafield
                ? selectedVariant.order_limit_metafield.value
                : selectedVariant.quantityAvailable
                ? selectedVariant.quantityAvailable
                : ''}
            </span>{' '}
            left in stock!
          </p>
        )}
      {/* {selectedVariant.availableForSale && (selectedVariant.order_limit_metafield || selectedVariant.quantityAvailable > 0 )} */}
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          open('cart');
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: variantQuantity,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

/**
 * @param {{option: VariantOption}}
 */
function ProductOptions({option}) {
  return (
    <div className="product-options mb-8" key={option.name}>
      <div
        className={
          option.name === 'Size' ? 'flex items-center justify-between' : ''
        }
      >
        <h3 className="text-sm font-medium text-gray-900">{option.name}</h3>
        {option.name === 'Size' && <SizeGuide />}
      </div>
      <div className="mt-4 gap-3 flex flex-wrap">
        {option.values.map(({value, isAvailable, isActive, to}) => {
          return (
            <Link
              className={classNames(
                isAvailable
                  ? 'cursor-pointer bg-white text-gray-900 shadow-sm'
                  : 'cursor-not-allowed bg-gray-50 text-gray-200',
                'group relative flex items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium capitalize hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-purple transition duration-300',
              )}
              key={option.name + value}
              prefetch="intent"
              preventScrollReset
              replace
              to={to}
            >
              <span>{value}</span>
              {isAvailable ? (
                <span
                  aria-hidden="true"
                  className={classNames(
                    isActive ? 'border-main-purple' : 'border-transparent',
                    'pointer-events-none absolute -inset-px rounded-md border-2 transition duration-200',
                  )}
                />
              ) : (
                <span
                  aria-hidden="true"
                  className={classNames(
                    isActive ? 'border-main-purple/30' : 'border-gray-200',
                    'pointer-events-none absolute -inset-px rounded-md border-2 transition duration-200',
                  )}
                >
                  <svg
                    stroke="currentColor"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className={classNames(
                      isActive ? 'text-main-purple/30' : 'text-gray-200',
                      'absolute inset-0 h-full w-full stroke-3 text-gray-200 transition duration-200',
                    )}
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
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SizeGuide() {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="text-sm font-medium text-main-purple hover:text-main-purple-dark cursor-pointer transition duration-300"
        onClick={() => setIsOpen(true)}
      >
        Size guide
      </button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/30 duration-300 ease-out data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            transition
            className="max-w-lg space-y-4 rounded-md bg-white p-8 duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <DialogTitle className="text-lg font-bold">Size guide</DialogTitle>
            <Description>Pariatur nostrud sint voluptate officia.</Description>
            <p>
              Consectetur officia qui duis reprehenderit consectetur aliquip do
              velit enim veniam magna consequat.
            </p>
            <button
              className="button px-3 py-2 mt-2"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

function QuantitySelector({
  quantity,
  handleDecrement,
  handleIncrement,
  selectedVariant,
}) {
  const rootData = useRouteLoaderData('root');

  return (
    <div className="mb-10">
      <h3 className="text-sm font-medium text-gray-900">
        <span className="">
          Quantity - STYLE THE DISABLE QUANTITY BUTTON AND CHECK WHY CART IS
          LOADING SO SLOW ON THE PRODUCT PAGE
        </span>
        <Suspense
          fallback={
            <span className="text-sm text-gray-500 animate-pulse">
              {' '}
              (Loading cart...)
            </span>
          }
        >
          <Await
            resolve={rootData.cart}
            errorElement={<div>An error occurred</div>}
          >
            {(cart) => {
              const itemIncart = cart.lines.nodes.find(
                (lineItem) => lineItem.merchandise.id === selectedVariant.id,
              );
              if (itemIncart) {
                return (
                  <span className=""> ({itemIncart.quantity} in cart)</span>
                );
              } else {
                return null;
              }
            }}
          </Await>
        </Suspense>
      </h3>
      <div className="mt-4 gap-3 flex flex-wrap">
        <button
          className="button px-2 py-1 border-main-purple border-2 bg-gray-50 text-main-purple hover:bg-gray-100"
          disabled={quantity <= 1}
          onClick={handleDecrement}
          type="button"
        >
          <MinusIcon aria-hidden="true" className="h-5 w-5" />
        </button>
        <div className="w-full max-w-16 text-center py-2 px-3 rounded-md text-sm border border-gray-300 text-gray-500 outline-none">
          {quantity}
        </div>
        <button
          className="button px-2 py-1"
          onClick={handleIncrement}
          type="button"
        >
          <PlusIcon aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen').VariantOption} VariantOption */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
