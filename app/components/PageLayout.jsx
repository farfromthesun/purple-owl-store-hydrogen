import {
  Await,
  Link,
  useFetcher,
  useFetchers,
  useLocation,
} from '@remix-run/react';
import {Suspense, useEffect, useRef, useState} from 'react';
import {Aside, useAside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {AnimatePresence} from 'framer-motion';
import {CartSummary} from './CartSummary';
import {CartForm} from '@shopify/hydrogen';

/**
 * @param {PageLayoutProps}
 */
export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}

      <main className="grow overflow-clip">
        {/* <AnimatePresence mode="wait" initial={true} key="PageLayout"> */}
        {children}
        {/* </AnimatePresence> */}
      </main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

/**
 * @param {{cart: PageLayoutProps['cart']}}
 */
function CartAside({cart}) {
  const {open, type} = useAside();
  const [blockCartDrawer, setBlockCartDrawer] = useState(false);

  const atcFetcher = useFetcher({key: 'addToCartFetcher'});

  useEffect(() => {
    if (atcFetcher && atcFetcher.state !== 'idle' && blockCartDrawer === true) {
      setBlockCartDrawer(false);
    }
  }, [atcFetcher, blockCartDrawer]);

  useEffect(() => {
    if (
      atcFetcher &&
      atcFetcher.state === 'idle' &&
      atcFetcher.data?.errors?.length === 0 &&
      type === 'closed' &&
      !blockCartDrawer
    ) {
      setTimeout(() => {
        open('cart');
      }, 1000);
      setBlockCartDrawer(true);
    }
  }, [atcFetcher, open, type, cart, blockCartDrawer]);

  // const fetchers = useFetchers();
  // const atcFetcher = fetchers.find((fetcher) => {
  //   if (fetcher.formData) {
  //     const formInputs = CartForm.getFormInput(fetcher.formData);
  //     if (
  //       formInputs.action === CartForm.ACTIONS.LinesAdd &&
  //       fetcher.state === 'loading'
  //       // && fetcher.data?.errors?.length === 0
  //     ) {
  //       return fetcher;
  //     }
  //   }
  //   return null;
  // });

  // toggle cart drawer when adding to cart
  // useEffect(() => {
  //   if (atcFetcher && type === 'closed') open('cart');
  // }, [atcFetcher, open, type]);
  // useEffect(() => {
  //   cart.then((currentCart) => {
  //     if (
  //       atcFetcher &&
  //       type === 'closed' &&
  //       atcFetcher?.data?.cart?.totalQuantity !== currentCart?.totalQuantity
  //     )
  //       open('cart');
  //   });
  // }, [atcFetcher, open, type, cart]);

  return (
    <Aside type="cart" heading="Your cart">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            const cartHasItems = cart?.totalQuantity > 0;

            return (
              <>
                <CartMain cart={cart} layout="aside" />
                {cartHasItems && <CartSummary cart={cart} layout="aside" />}
              </>
            );
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const {open, type} = useAside();
  const location = useLocation();

  useEffect(() => {
    function handleKeyDown(event) {
      if (location.pathname === SEARCH_ENDPOINT) return;
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        type === 'closed' && open('search');
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, type, location.pathname]);

  return (
    <Aside type="search" heading="Search">
      <div className="mt-2 pb-6 flex-1 px-4 sm:px-6 overflow-y-auto">
        <SearchFormPredictive className="sticky top-0 bg-white pb-3">
          {({fetchResults, goToSearch, inputRef}) => (
            <div className="flex gap-x-2 pt-1">
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
                className="w-full py-2 px-3 rounded-md text-sm border-gray-300 text-gray-500 focus:border-main-purple transition duration-200 outline-none"
              />
              <button className="button py-2 px-3 text-sm" onClick={goToSearch}>
                Search
              </button>
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, inputRef, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return (
                <p className="mt-3 text-sm text-gray-500 animate-fade-in-blur-in">
                  Loading...
                </p>
              );
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <div className="mt-3">
                {/* <SearchResultsPredictive.Queries
                  queries={queries}
                  inputRef={inputRef}
                /> */}
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                    className="text-main-purple hover:text-main-purple-dark transition duration-300 animate-fade-in-blur-in"
                    preventScrollReset
                  >
                    <p>
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </div>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

/**
 * @param {{
 *   header: PageLayoutProps['header'];
 *   publicStoreDomain: PageLayoutProps['publicStoreDomain'];
 * }}
 */
function MobileMenuAside({header, publicStoreDomain}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="Menu">
        <div className="mt-2 pb-6 flex-1 px-4 sm:px-6 overflow-y-auto flex flex-col justify-center text-center">
          <HeaderMenu
            menu={header.menu}
            viewport="mobile"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />
        </div>
      </Aside>
    )
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
