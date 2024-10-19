import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import {PlusIcon, MinusIcon} from '@heroicons/react/16/solid';
import {Await, Link, useRouteLoaderData} from '@remix-run/react';
import {Image, VariantSelector} from '@shopify/hydrogen';
import {Suspense, useState} from 'react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ProductPrice} from './ProductPrice';

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
  const [addOns, setAddOns] = useState([]);
  const [extraOptions, setExtraOptions] = useState([]);

  const variantQuantityDecrement = () => {
    if (variantQuantity === 1) return;
    setVariantQuantity(variantQuantity - 1);
  };
  const variantQuantityIncrement = () => {
    setVariantQuantity(variantQuantity + 1);
  };

  return (
    <div className="product-form mt-10">
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
      {product.add_ons_metafield && (
        <AddOns product={product} setAddOns={setAddOns} />
      )}
      <ExtraOptons
        product={product}
        extraOptions={extraOptions}
        setExtraOptions={setExtraOptions}
      />
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
                  attributes: extraOptions ? extraOptions : [],
                },
                ...addOns,
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
                'group relative flex items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium capitalize hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-purple transition duration-200',
              )}
              key={option.name + value}
              prefetch="intent"
              preventScrollReset
              replace
              to={to}
            >
              <span>{value}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  isAvailable ? 'opacity-100' : 'opacity-0',
                  isActive ? 'border-main-purple' : 'border-transparent',
                  'pointer-events-none absolute -inset-px rounded-md border-2 transition duration-200',
                )}
              />
              <span
                aria-hidden="true"
                className={classNames(
                  isAvailable ? 'opacity-0' : 'opacity-100',
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
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-900">
        <span>Quantity</span>
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
              if (!cart) return null;
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
          className={classNames(
            quantity > 1
              ? 'cursor-pointer bg-white text-gray-900 shadow-sm'
              : 'cursor-not-allowed bg-gray-50 text-gray-200',
            'group relative flex items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium capitalize hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-purple transition duration-200',
          )}
          disabled={quantity <= 1}
          onClick={handleDecrement}
          type="button"
        >
          <span>
            <MinusIcon aria-hidden="true" className="h-5 w-5" />
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
        <div className="w-full max-w-16 text-center py-2 px-3 rounded-md text-sm border border-gray-300 text-gray-500 outline-none">
          {quantity}
        </div>
        <button
          className="group relative flex items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium capitalize hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-purple transition duration-200 cursor-pointer bg-white text-gray-900 shadow-sm"
          onClick={handleIncrement}
          type="button"
        >
          <span>
            <PlusIcon aria-hidden="true" className="h-5 w-5" />
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px rounded-md border-2 border-transparent transition duration-200 lg:group-hover:border-main-purple"
          />
        </button>
      </div>
      {selectedVariant.availableForSale &&
        selectedVariant.quantityAvailable > 0 && (
          <p className="text-main-purple text-sm font-medium mt-4 animate-fade-in flex items-center gap-1">
            Only{' '}
            <span className="badge">{selectedVariant.quantityAvailable}</span>{' '}
            left in stock!
          </p>
        )}
      {selectedVariant.availableForSale &&
        selectedVariant.order_limit_metafield && (
          <p className="text-main-purple text-sm font-medium mt-4 animate-fade-in flex items-center gap-1">
            Product limited to only{' '}
            <span className="badge">
              {selectedVariant.order_limit_metafield.value}
            </span>{' '}
            units per order.
          </p>
        )}
    </div>
  );
}

function AddOns({product, setAddOns}) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-900">Add-ons</h3>
      <div className="mt-4">
        {product.add_ons_metafield.references.nodes.map((addOn) => (
          <div
            key={addOn.id.split('Product/')[1]}
            className="inline-flex items-center mb-4 last:mb-0 group"
          >
            <input
              id={`add-on-${addOn.id.split('Product/')[1]}`}
              name={`add-on-${addOn.id.split('Product/')[1]}`}
              value={JSON.stringify(addOn.defaultVariant)}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 checked:bg-main-purple checked:border-transparent transition duration-200 lg:group-hover:border-main-purple lg:cursor-pointer outline-main-purple"
              onChange={(event) => {
                const addOnVariant = JSON.parse(event.target.value);
                const isChecked = event.target.checked;
                setAddOns((prevAddOns) => {
                  const isAddOnAlreadyInState = prevAddOns.find(
                    (prevAddOn) => prevAddOn.merchandiseId === addOnVariant.id,
                  );
                  if (isChecked && !isAddOnAlreadyInState) {
                    return [
                      ...prevAddOns,
                      {
                        merchandiseId: addOnVariant.id,
                        quantity: 1,
                        selectedVariant: addOnVariant,
                      },
                    ];
                  } else if (!isChecked && isAddOnAlreadyInState) {
                    return prevAddOns.filter(
                      (prevAddOn) =>
                        prevAddOn.merchandiseId !== addOnVariant.id,
                    );
                  }
                });
              }}
            />
            <label
              htmlFor={`add-on-${addOn.id.split('Product/')[1]}`}
              className="flex items-center gap-3 ml-3 min-w-0 text-sm lg:group-hover:text-main-purple lg:transition lg:duration-200 lg:cursor-pointer"
            >
              <Image
                alt={addOn.title}
                aspectRatio="1/1"
                data={addOn.images.nodes[0]}
                height={50}
                loading="lazy"
                width={50}
                className="rounded-md lg:group-hover:opacity-75 lg:transition lg:duration-200"
              />
              <div className="flex items-center">
                {addOn.title}
                <span className="mx-2">-</span>
                <ProductPrice
                  price={addOn.defaultVariant.price}
                  compareAtPrice={addOn.defaultVariant.compareAtPrice}
                  motionLayout={false}
                />
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExtraOptons({product, extraOptions, setExtraOptions}) {
  const extraOptionsArray = [
    {
      key: 'Aadditional protective wrapping',
      value: 'yes',
      slogan: 'Add extra layer of protective wrapping?',
    },
    {
      key: 'Gift wrapping with label',
      value: 'yes',
      slogan: 'Wrap as a gift with additional colorful label?',
    },
  ];
  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-900">Extra options</h3>
      <div className="mt-4">
        {extraOptionsArray.map((extraOption) => (
          <div
            className="inline-flex items-center mb-4 last:mb-0 group"
            key={extraOption.key}
          >
            <input
              id={`extra-option-${extraOption.key}`}
              name={`extra-option-${extraOption.key}`}
              value={extraOption.value}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 checked:bg-main-purple checked:border-transparent transition duration-200 lg:group-hover:border-main-purple lg:cursor-pointer outline-main-purple"
              onChange={(event) => {
                const isChecked = event.target.checked;
                setExtraOptions((prevExtraOptions) => {
                  const isOptionAlreadyInState = prevExtraOptions.find(
                    (prevExtraOption) =>
                      prevExtraOption.key === extraOption.key,
                  );
                  if (isChecked && !isOptionAlreadyInState) {
                    return [
                      ...prevExtraOptions,
                      {
                        key: extraOption.key,
                        value: extraOption.value,
                      },
                    ];
                  } else if (!isChecked && isOptionAlreadyInState) {
                    return prevExtraOptions.filter(
                      (prevExtraOption) =>
                        prevExtraOption.key !== extraOption.key,
                    );
                  }
                });
              }}
            />
            <label
              htmlFor={`extra-option-${extraOption.key}`}
              className="flex items-center gap-3 ml-3 min-w-0 text-sm lg:group-hover:text-main-purple lg:transition lg:duration-200 lg:cursor-pointer"
            >
              <div className="flex items-center">{extraOption.slogan}</div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen').VariantOption} VariantOption */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
