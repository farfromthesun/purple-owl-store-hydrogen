import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {createContext, useContext, useState} from 'react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 * @param {{
 *   children?: React.ReactNode;
 *   type: AsideType;
 *   heading: React.ReactNode;
 * }}
 */
export function Aside({children, heading, type}) {
  const {type: activeType, close} = useAside();
  const isOpen = type === activeType;

  return (
    // <div
    //   aria-modal
    //   className={`overlay ${expanded ? 'expanded' : ''}`}
    //   role="dialog"
    // >
    //   <button className="close-outside" onClick={close} />
    //   <aside>
    //     <header>
    //       <h3>{heading}</h3>
    //       <button className="close reset" onClick={close}>
    //         &times;
    //       </button>
    //     </header>
    //     <main className="px-6 py-6">{children}</main>
    //   </aside>
    // </div>

    <Dialog open={isOpen} onClose={close} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 transition-opacity duration-300 ease-in-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-300 ease-in-out data-[closed]:translate-x-full sm:duration-400"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="flex items-start justify-between px-4 py-6 sm:px-6">
                  <DialogTitle className="text-lg font-medium text-gray-900">
                    {heading}
                  </DialogTitle>
                  <div className="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      onClick={close}
                      className="relative -m-2 p-2 text-gray-400 hover:text-main-purple cursor-pointer transition duration-300"
                    >
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Close panel</span>
                      <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div
                  className={classNames(
                    activeType === 'filters'
                      ? '-mx-4 border-t border-gray-200'
                      : '',
                    'mt-2 px-4 pb-6 sm:px-6 flex-1',
                  )}
                >
                  <div className="flow-root">{children}</div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
/**
 * @typedef {{
 *   type: AsideType;
 *   open: (mode: AsideType) => void;
 *   close: () => void;
 * }} AsideContextValue
 */

/** @typedef {import('react').ReactNode} ReactNode */
