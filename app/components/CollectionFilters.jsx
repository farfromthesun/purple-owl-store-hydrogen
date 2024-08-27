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
const filters = [
  {
    id: 'color',
    name: 'Color',
    options: [
      {value: 'white', label: 'White', checked: false},
      {value: 'beige', label: 'Beige', checked: false},
      {value: 'blue', label: 'Blue', checked: true},
      {value: 'brown', label: 'Brown', checked: false},
      {value: 'green', label: 'Green', checked: false},
      {value: 'purple', label: 'Purple', checked: false},
    ],
  },
  {
    id: 'category',
    name: 'Category',
    options: [
      {value: 'new-arrivals', label: 'New Arrivals', checked: false},
      {value: 'sale', label: 'Sale', checked: false},
      {value: 'travel', label: 'Travel', checked: true},
      {value: 'organization', label: 'Organization', checked: false},
      {value: 'accessories', label: 'Accessories', checked: false},
    ],
  },
  {
    id: 'size',
    name: 'Size',
    options: [
      {value: '2l', label: '2L', checked: false},
      {value: '6l', label: '6L', checked: false},
      {value: '12l', label: '12L', checked: false},
      {value: '18l', label: '18L', checked: false},
      {value: '20l', label: '20L', checked: false},
      {value: '40l', label: '40L', checked: true},
    ],
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function CategoryFilters({children}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="bg-white">
      <div>
        {/* Mobile filter dialog */}
        <Dialog
          open={mobileFiltersOpen}
          onClose={setMobileFiltersOpen}
          className="relative z-40 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
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
              <form className="mt-4 border-t border-gray-200">
                {filters.map((section) => (
                  <Disclosure
                    key={section.id}
                    as="div"
                    className="border-t border-gray-200 px-4 py-6"
                  >
                    <h3 className="-mx-2 -my-3 flow-root">
                      <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                        <span className="font-medium text-gray-900">
                          {section.name}
                        </span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon
                            aria-hidden="true"
                            className="h-5 w-5 group-data-[open]:hidden"
                          />
                          <MinusIcon
                            aria-hidden="true"
                            className="h-5 w-5 [.group:not([data-open])_&]:hidden"
                          />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pt-6">
                      <div className="space-y-6">
                        {section.options.map((option, optionIdx) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              defaultValue={option.value}
                              defaultChecked={option.checked}
                              id={`filter-mobile-${section.id}-${optionIdx}`}
                              name={`${section.id}[]`}
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 checked:bg-main-purple checked:border-transparent transition duration-200"
                            />
                            <label
                              htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                              className="ml-3 min-w-0 flex-1 text-gray-500"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </form>
            </DialogPanel>
          </div>
        </Dialog>

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
                            <span className="ml-6 flex items-center group-hover:text-main-purple transition duration-300">
                              <PlusIcon
                                aria-hidden="true"
                                className="h-5 w-5 group-data-[open]:hidden"
                              />
                              <MinusIcon
                                aria-hidden="true"
                                className="h-5 w-5 [.group:not([data-open])_&]:hidden"
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
                                  className=" origin-top"
                                >
                                  <div className="pt-6 space-y-4">
                                    {section.options.map(
                                      (option, optionIdx) => (
                                        <div
                                          key={option.value}
                                          className="flex"
                                        >
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
                                      ),
                                    )}
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

              {/* Product grid */}
              <div className="lg:col-span-3">{children}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FilterCheckbox() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Field className="flex items-center gap-2">
      <Checkbox
        checked={enabled}
        onChange={setEnabled}
        name="add-checkbox-name-here"
        className="group block size-4 rounded border bg-white data-[checked]:bg-main-purple flex justify-center items-center data-[checked]:border-main-purple"
      >
        <CheckIcon
          aria-hidden="true"
          className="h-3 w-3 stroke-white"
          strokeWidth={2}
        />
        {/* <svg
          className="stroke-white opacity-0 group-data-[checked]:opacity-100"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M3 8L6 11L11 3.5"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg> */}
        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-3 stroke-white opacity-0 group-data-[checked]:opacity-100"
        >
          <path
            fillRule="evenodd"
            strokeWidth={2}
            d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
            clipRule="evenodd"
          />
        </svg> */}
      </Checkbox>
      <Label>Enable beta features</Label>
    </Field>
  );
}
