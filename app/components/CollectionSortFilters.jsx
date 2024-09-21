import {Fragment, useState} from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {
  ChevronDownIcon,
  FunnelIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';
import {AnimatePresence, motion} from 'framer-motion';
import {Form, Link, useLocation, useSearchParams} from '@remix-run/react';
import {useDebounceSubmit} from 'remix-utils/use-debounce-submit';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const FILTER_URL_PREFIX = 'filter.';
const FILTER_DEBOUNCE = 500;

export function CollectionSortFilters({filters, appliedFilters, children}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [params] = useSearchParams();

  return (
    <div className="bg-white">
      {/* Mobile filter dialog */}
      <Dialog
        open={mobileFiltersOpen}
        onClose={setMobileFiltersOpen}
        className="relative z-40 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative ml-auto flex h-full w-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:translate-x-full"
          >
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            {/* Filters */}
            <div className="mt-4 border-t border-gray-200">
              <FiltersList filters={filters} viewport="mobile" />
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Desktop filters & sort */}
      <div className="mx-auto max-w-1400 px-4 sm:px-6 lg:px-8">
        {/* <div
          className={`flex items-baseline border-b border-gray-200 pb-6 pt-24 ${
            appliedFilters.length > 0 ? 'justify-between' : 'justify-end'
          }`}
        > */}
        <div
          className={`grid grid-rows-[auto_auto] gap-y-3 lg:grid-rows-none lg:gap-y-0 items-baseline border-b border-gray-200 pb-6 pt-24 ${
            appliedFilters.length > 0
              ? 'grid-cols-2 lg:grid-cols-[auto_1fr_auto]'
              : 'grid-cols-1 lg:grid-cols-1'
          }`}
        >
          {appliedFilters.length > 0 && (
            <>
              <div className="">
                <span className="text-sm tracking-tight text-gray-900 block lg:mr-2">
                  Applied filters:
                </span>
              </div>
              <div className="row-start-2 col-start-1 col-span-2 flex flex-wrap gap-2 lg:row-start-1 lg:col-start-2 lg:col-span-1">
                {appliedFilters.map((appliedFilter) => {
                  const baseKey = Object.keys(appliedFilter)[0];
                  const filterKey = Object.keys(appliedFilter[baseKey])[0];
                  const url = [...params]
                    .filter((param) => {
                      if (filterKey === 'price') {
                        return !param[0].includes('price');
                      } else {
                        return (
                          param[0] + '=' + param[1] !==
                          baseKey +
                            '.' +
                            filterKey +
                            '=' +
                            JSON.stringify(appliedFilter[baseKey][filterKey])
                        );
                      }
                    })
                    .reduce((accumulator, param) => {
                      const before = accumulator === '' ? '' : '&';
                      return (accumulator +=
                        before + param[0] + '=' + param[1]);
                    }, '');

                  return (
                    <Link
                      key={appliedFilter.label}
                      to={'?' + url}
                      className="badge gap-1"
                      preventScrollReset
                    >
                      {appliedFilter.label}
                      <XMarkIcon aria-hidden="true" className="size-4" />
                    </Link>
                  );
                })}
              </div>
            </>
          )}
          <div className="flex items-center justify-end">
            <SortMenu />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
            >
              <span className="sr-only">Filters</span>
              <FunnelIcon aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <section aria-labelledby="products-heading" className="pb-24 pt-6">
          <h2 id="products-heading" className="sr-only">
            Products
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            {/* Filters */}
            <div className="hidden lg:block">
              <FiltersList filters={filters} viewport="desktop" />
            </div>

            {/* Product grid */}
            <div className="lg:col-span-3">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FiltersList({filters, viewport}) {
  const [params] = useSearchParams();
  const submit = useDebounceSubmit();
  const filterDropdownVariants = {
    open: {
      opacity: 1,
      visibility: 'visible',
      height: 'auto',
    },
    closed: {
      opacity: 0,
      visibility: 'hidden',
      height: 0,
    },
  };

  function filterMarkup(filter, option, viewport) {
    switch (filter.type) {
      case 'PRICE_RANGE':
        const priceFilterMin = params.get(`${FILTER_URL_PREFIX}price.min`);
        const priceFilterMax = params.get(`${FILTER_URL_PREFIX}price.max`);
        const priceMin = priceFilterMin
          ? isNaN(Number(priceFilterMin))
            ? undefined
            : JSON.parse(priceFilterMin)
          : undefined;
        const priceMax = priceFilterMax
          ? isNaN(Number(priceFilterMax))
            ? undefined
            : JSON.parse(priceFilterMax)
          : undefined;
        // const min = isNaN(Number(priceMin)) ? undefined : Number(priceMin);
        // const max = isNaN(Number(priceMax)) ? undefined : Number(priceMax);

        return (
          <PriceRangeFilter
            min={priceMin}
            max={priceMax}
            option={option}
            viewport={viewport}
          />
        );

      default:
        const optionInput = JSON.parse(option.input);
        const filterName = 'filter.' + Object.keys(optionInput)[0];
        const filterValue = JSON.stringify(Object.values(optionInput)[0]);

        const shouldBeChecked = [...params].find((element) => {
          return (
            filterName + '=' + filterValue === element[0] + '=' + element[1]
          );
        });

        return (
          <div className="flex items-center group lg:cursor-pointer">
            <input
              key={shouldBeChecked}
              data-shouldbechecked={shouldBeChecked ? true : false}
              defaultChecked={shouldBeChecked}
              id={`${viewport}-${option.id}`}
              name={filterName}
              value={filterValue}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 checked:bg-main-purple checked:border-transparent transition duration-200 lg:group-hover:border-main-purple lg:cursor-pointer"
              onChange={(event) => {
                const form = event.target.form;
                submit(form, {
                  debounceTimeout: FILTER_DEBOUNCE,
                  preventScrollReset: true,
                });
              }}
            />
            <label
              htmlFor={`${viewport}-${option.id}`}
              className="ml-3 min-w-0 text-gray-500 text-sm lg:group-hover:text-main-purple lg:transition lg:duration-200 lg:cursor-pointer"
            >
              {`${option.label} (${option.count})`}
            </label>
          </div>
        );
    }
  }

  return (
    <Form preventScrollReset>
      <input
        type="hidden"
        name="sort"
        id="sort-value-from-params"
        defaultValue={params.get('sort')}
      />
      {filters.map((filter) => (
        <Disclosure
          key={filter.id}
          as="div"
          className="border-b border-gray-200 px-4 lg:px-0 py-6 lg:first:pt-1"
        >
          {({open}) => (
            <>
              <h3 className="-mx-2 lg:-mx-0 -my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 lg:px-0 py-3 text-sm text-gray-400 hover:text-gray-500 lg:cursor-pointer">
                  <span className="font-medium text-gray-900 lg:group-hover:text-main-purple lg:transition lg:duration-300">
                    {filter.label}
                  </span>
                  <span className="ml-6 flex items-center relative justify-end lg:group-hover:text-main-purple lg:transition lg:duration-300">
                    <PlusIcon
                      aria-hidden="true"
                      className="h-5 w-5 group-data-[open]:opacity-0 absolute transition duration-300"
                    />
                    <MinusIcon
                      aria-hidden="true"
                      className="h-5 w-5 [.group:not([data-open])_&]:opacity-0 absolute transition duration-300"
                    />
                  </span>
                </DisclosureButton>
              </h3>

              <AnimatePresence initial={false}>
                {/* {open && ( */}
                <DisclosurePanel static as={Fragment}>
                  {/* <motion.div
                      initial={{opacity: 0, height: 0}}
                      animate={{opacity: 1, height: 'auto'}}
                      exit={{opacity: 0, height: 0}}
                      transition={{duration: 0.2, ease: easeOut}}
                      className=" origin-top overflow-hidden"
                    > */}
                  <motion.div
                    variants={filterDropdownVariants}
                    animate={open ? 'open' : 'closed'}
                    className=" origin-top overflow-hidden"
                  >
                    <div
                      key={filter.id}
                      className="mt-6 space-y-4 max-h-[30svh] overflow-auto p-1"
                    >
                      {filter.values?.map((option, optionIdx) => (
                        <div
                          key={option.id}
                          className={`${
                            filter.type === 'PRICE_RANGE' ? '' : 'flex'
                          }`}
                        >
                          {filterMarkup(filter, option, viewport)}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </DisclosurePanel>
                {/* )} */}
              </AnimatePresence>
            </>
          )}
        </Disclosure>
      ))}
    </Form>
  );
}

function PriceRangeFilter({min, max, option, viewport}) {
  const submit = useDebounceSubmit();
  const optionInput = JSON.parse(option.input);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <label
          htmlFor={`${viewport}-${option.id}-min`}
          className="text-sm mr-3 text-gray-500"
        >
          From
        </label>
        <input
          id={`${viewport}-${option.id}-min`}
          name={`filter.${Object.keys(optionInput)[0]}.${
            Object.keys(optionInput.price)[0]
          }`}
          className="w-full max-w-44 py-2 px-3 rounded text-sm border-gray-300 text-gray-500 focus:border-main-purple transition duration-200 outline-none"
          type="number"
          defaultValue={min ?? ''}
          key={min}
          min="0"
          placeholder="$"
          onChange={(event) => {
            const form = event.target.form;

            submit(form, {
              debounceTimeout: FILTER_DEBOUNCE,
              preventScrollReset: true,
            });
          }}
        />
      </div>
      <div className="flex justify-between items-center">
        <label
          htmlFor={`${viewport}-${option.id}-max`}
          className="text-sm mr-3 text-gray-500"
        >
          To
        </label>
        <input
          id={`${viewport}-${option.id}-max`}
          name={`filter.${Object.keys(optionInput)[0]}.${
            Object.keys(optionInput.price)[1]
          }`}
          className="w-full max-w-44 py-2 px-3 rounded text-sm border-gray-300 text-gray-500 focus:border-main-purple transition duration-200 outline-none"
          type="number"
          key={max}
          min="0"
          defaultValue={max ?? ''}
          placeholder="$"
          onChange={(event) => {
            const form = event.target.form;
            submit(form, {
              debounceTimeout: FILTER_DEBOUNCE,
              preventScrollReset: true,
            });
          }}
        />
      </div>
    </>
  );
}

function getSortLink(sort, params, location) {
  // params.set('sort', sort);
  const paramsMapped = [...params].map((param) => {
    if (param.includes('sort')) {
      param[1] = sort;
      return param;
    } else {
      return param;
    }
  });
  if (paramsMapped.length > 0) {
    const paramsForLink = new URLSearchParams(
      paramsMapped.map((param) => param),
    );
    return `${location.pathname}?${paramsForLink.toString()}`;
  } else {
    params.set('sort', sort);
    return `${location.pathname}?${params.toString()}`;
  }
}

function SortMenu() {
  const items = [
    {label: 'Featured', key: 'featured', current: true},
    {
      label: 'Price: Low - High',
      key: 'price-low-high',
      current: false,
    },
    {
      label: 'Price: High - Low',
      key: 'price-high-low',
      current: false,
    },
    {
      label: 'Best Selling',
      key: 'best-selling',
      current: false,
    },
    {
      label: 'Newest',
      key: 'newest',
      current: false,
    },
  ];
  const [params] = useSearchParams();
  const location = useLocation();
  const activeItem = items.find((item) => item.key === params.get('sort'));

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 lg:hover:text-main-purple cursor-pointer transition duration-300 py-1">
          Sort
          <ChevronDownIcon
            aria-hidden="true"
            className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-main-purple transition duration-300"
          />
        </MenuButton>
      </div>
      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-gray-200 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="py-1">
          {items.map((item) => (
            <MenuItem key={item.label}>
              {() => (
                <Link
                  to={getSortLink(item.key, params, location)}
                  preventScrollReset
                  data-active-item-key={activeItem?.key}
                  data-item-key={item.key}
                  className={classNames(
                    activeItem?.key === item.key
                      ? 'font-bold text-main-purple-super-dark underline'
                      : 'text-gray-500',
                    'block px-4 py-2 text-sm data-[focus]:bg-main-purple data-[focus]:text-white transition duration-100',
                  )}
                >
                  {item.label}
                </Link>
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}
