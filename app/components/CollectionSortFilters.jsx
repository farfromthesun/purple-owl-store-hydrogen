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
import {Form, Link, useSearchParams} from '@remix-run/react';
import {useDebounceSubmit} from 'remix-utils/use-debounce-submit';

const sortOptions = [
  {name: 'Most Popular', href: '#', current: true},
  {name: 'Best Rating', href: '#', current: false},
  {name: 'Newest', href: '#', current: false},
  {name: 'Price: Low to High', href: '#', current: false},
  {name: 'Price: High to Low', href: '#', current: false},
];

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
        <div
          className={`flex items-baseline border-b border-gray-200 pb-6 pt-24 ${
            appliedFilters.length > 0 ? 'justify-between' : 'justify-end'
          }`}
        >
          {appliedFilters.length > 0 && (
            <div className="flex items-center">
              <span className="text-sm tracking-tight text-gray-900 mr-2">
                Applied filters:
              </span>
              <div>
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
                      className="badge"
                      preventScrollReset
                    >
                      {appliedFilter.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex items-center">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 lg:hover:text-main-purple cursor-pointer transition duration-300">
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
                  {sortOptions.map((option) => (
                    <MenuItem key={option.name}>
                      <a
                        href={option.href}
                        className={classNames(
                          option.current
                            ? 'font-medium text-main-purple'
                            : 'text-gray-500',
                          'block px-4 py-2 text-sm data-[focus]:bg-main-purple-light data-[focus]:text-white transition duration-100',
                        )}
                      >
                        {option.name}
                      </a>
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            </Menu>
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
      {filters.map((filter) => (
        <Disclosure
          key={filter.id}
          as="div"
          className="border-b border-gray-200 px-4 lg:px-0 py-6"
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
