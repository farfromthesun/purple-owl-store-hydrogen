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
  Checkbox,
  Field,
  Label,
} from '@headlessui/react';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {
  ChevronDownIcon,
  FunnelIcon,
  MinusIcon,
  PlusIcon,
  CheckIcon,
  Squares2X2Icon,
} from '@heroicons/react/20/solid';
import {AnimatePresence, easeOut, motion} from 'framer-motion';

const sortOptions = [
  {name: 'Most Popular', href: '#', current: true},
  {name: 'Best Rating', href: '#', current: false},
  {name: 'Newest', href: '#', current: false},
  {name: 'Price: Low to High', href: '#', current: false},
  {name: 'Price: High to Low', href: '#', current: false},
];
// const filters = [
//   {
//     id: 'color',
//     name: 'Color',
//     options: [
//       {value: 'white', label: 'White', checked: false},
//       {value: 'beige', label: 'Beige', checked: false},
//       {value: 'blue', label: 'Blue', checked: true},
//       {value: 'brown', label: 'Brown', checked: false},
//       {value: 'green', label: 'Green', checked: false},
//       {value: 'purple', label: 'Purple', checked: false},
//     ],
//   },
//   {
//     id: 'category',
//     name: 'Category',
//     options: [
//       {value: 'new-arrivals', label: 'New Arrivals', checked: false},
//       {value: 'sale', label: 'Sale', checked: false},
//       {value: 'travel', label: 'Travel', checked: true},
//       {value: 'organization', label: 'Organization', checked: false},
//       {value: 'accessories', label: 'Accessories', checked: false},
//     ],
//   },
//   {
//     id: 'size',
//     name: 'Size',
//     options: [
//       {value: '2l', label: '2L', checked: false},
//       {value: '6l', label: '6L', checked: false},
//       {value: '12l', label: '12L', checked: false},
//       {value: '18l', label: '18L', checked: false},
//       {value: '20l', label: '20L', checked: false},
//       {value: '40l', label: '40L', checked: true},
//     ],
//   },
// ];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function filterMarkup(filter, option) {
  switch (filter.type) {
    case 'PRICE_RANGE':
      return 'Price range';

    default:
      return (
        <>
          <input
            // defaultValue={option.value}
            // defaultChecked={option.checked}
            id={`mobile-${option.id}`}
            name={option.id}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 checked:bg-main-purple checked:border-transparent transition duration-200"
          />
          <label
            htmlFor={`mobile-${option.id}`}
            className="ml-3 min-w-0 flex-1 text-gray-500"
          >
            {`${option.label} (${option.count})`}
          </label>
        </>
      );
  }
}

export function CollectionFilters({filters, children}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
            <FiltersMobile filters={filters} />
          </DialogPanel>
        </div>
      </Dialog>

      {/* Desktop filters */}
      <div className="mx-auto max-w-1400 px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
          <span className="text-sm tracking-tight text-gray-900">
            Active filters : 0
          </span>
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
            <FiltersDesktop filters={filters} />

            {/* Product grid */}
            <div className="lg:col-span-3">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FiltersMobile({filters}) {
  return (
    <form className="mt-4 border-t border-gray-200">
      {filters.map((filter) => (
        <Disclosure
          key={filter.id}
          as="div"
          className="border-t border-gray-200 px-4 py-6"
        >
          {({open}) => (
            <>
              <h3 className="-mx-2 -my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">
                    {filter.label}
                  </span>
                  <span className="ml-6 flex items-center relative justify-end">
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

              <div>
                <AnimatePresence initial={false}>
                  {open && (
                    <DisclosurePanel static as={Fragment}>
                      <motion.div
                        initial={{opacity: 0, height: 0}}
                        animate={{opacity: 1, height: 'auto'}}
                        exit={{opacity: 0, height: 0}}
                        transition={{duration: 0.2, ease: easeOut}}
                        className=" origin-top overflow-hidden"
                      >
                        <div key={filter.id} className="pt-6 space-y-6">
                          {filter.values?.map((option, optionIdx) => (
                            <div key={option.id} className="flex items-center">
                              {filterMarkup(filter, option)}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </DisclosurePanel>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </Disclosure>
      ))}
    </form>
  );
}

function FiltersDesktop({filters}) {
  return (
    <form className="hidden lg:block">
      {filters.map((section) => (
        <Disclosure
          key={section.id}
          as="div"
          className="border-b border-gray-200 py-6"
        >
          {({open}) => (
            <>
              <h3 className="-my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500 cursor-pointer group">
                  <span className="font-medium text-gray-900 group-hover:text-main-purple transition duration-300">
                    {section.name}
                  </span>
                  <span className="ml-6 flex items-center relative justify-end group-hover:text-main-purple transition duration-300">
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
              <div className="">
                <AnimatePresence initial={false}>
                  {open && (
                    <DisclosurePanel static as={Fragment}>
                      <motion.div
                        initial={{opacity: 0, height: 0}}
                        animate={{opacity: 1, height: 'auto'}}
                        exit={{opacity: 0, height: 0}}
                        transition={{duration: 0.2, ease: easeOut}}
                        className=" origin-top overflow-hidden"
                      >
                        <div className="pt-6 space-y-4">
                          {section.options.map((option, optionIdx) => (
                            <div key={option.value} className="flex">
                              <div className="flex items-center group cursor-pointer">
                                <input
                                  defaultValue={option.value}
                                  defaultChecked={option.checked}
                                  id={`filter-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 checked:bg-main-purple checked:border-transparent transition duration-200 group-hover:border-main-purple cursor-pointer"
                                />
                                <label
                                  htmlFor={`filter-${section.id}-${optionIdx}`}
                                  className="ml-3 text-sm text-gray-600 group-hover:text-main-purple transition duration-200 cursor-pointer"
                                >
                                  {option.label}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </DisclosurePanel>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </Disclosure>
      ))}
    </form>
  );
}
