import {Suspense} from 'react';
import {Await, NavLink} from '@remix-run/react';
import {useAnalytics} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  UserIcon,
  UserCircleIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  return (
    <>
      {/* <header className="header">
        <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
          <strong>{shop.name}</strong>
        </NavLink>
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </header> */}
      <header className="bg-white">
        <div className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1 order-3 lg:order-1">
            <NavLink prefetch="intent" to="/" className="-m-1.5 p-1.5" end>
              <strong className="text-main-purple font-logo text-lg lg:text-3xl font-extrabold">
                {shop.name}
              </strong>
            </NavLink>
          </div>
          <div className="flex gap-4 order-1">
            <div className="flex lg:hidden">
              <HeaderMenuMobileToggle />
            </div>
            <div className="lg:hidden">
              <SearchToggle />
            </div>
          </div>
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
          />
          <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
        </div>
      </header>
    </>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  // const className = `header-menu-${viewport}`;

  function closeAside(event) {
    if (viewport === 'mobile') {
      event.preventDefault();
      window.location.href = event.currentTarget.href;
    }
  }

  return (
    // <nav className={className} role="navigation">
    <nav
      className={`lg:flex lg:gap-x-12 lg:order-2 ${
        viewport === 'desktop' ? 'hidden ' : 'space-y-2 pb-5'
      }`}
      role="navigation"
    >
      {/* {viewport === 'mobile' && (
        <NavLink end onClick={closeAside} prefetch="intent" to="/">
          Home
        </NavLink>
      )} */}
      {menu.items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="md:text-sm lg:px-0 lg:py-0 lg:-mx-0 lg:text-base font-semibold lg:leading-6 aria-[current]:!text-main-purple transition group overflow-hidden relative -mx-3 block px-3 py-2 text-base leading-7 text-gray-900"
            end
            key={item.id}
            onClick={closeAside}
            prefetch="intent"
            to={url}
          >
            <span className="block lg:group-hover:-translate-y-full lg:group-hover:opacity-0 transition duration-400">
              {item.title}
            </span>
            <span className="block absolute top-full translate-y-0 opacity-0 lg:group-hover:-translate-y-full lg:group-hover:opacity-100 transition duration-400">
              {item.title}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav
      className="flex lg:flex-1 lg:justify-end gap-4 lg:gap-6 order-4 items-center"
      role="navigation"
    >
      {/* <HeaderMenuMobileToggle /> */}
      <NavLink
        prefetch="intent"
        to="/account"
        className="text-sm lg:text-base font-semibold leading-6 text-gray-900 lg:hover:!text-main-purple transition duration-300"
      >
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (
              <div>
                <span className="sr-only">
                  {isLoggedIn ? 'Account' : 'Sign in'}
                </span>
                {isLoggedIn ? (
                  <UserCircleIcon aria-hidden="true" className="h-6 w-6" />
                ) : (
                  <UserIcon aria-hidden="true" className="h-6 w-6" />
                )}
              </div>
            )}
          </Await>
        </Suspense>
      </NavLink>
      <div className="hidden lg:block">
        <SearchToggle />
      </div>
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
      onClick={() => open('mobile')}
    >
      <span className="sr-only">Open main menu</span>
      <Bars3Icon aria-hidden="true" className="h-6 w-6" />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="text-sm lg:text-base font-semibold leading-6 text-gray-900 cursor-pointer flex items-center lg:hover:text-main-purple transition duration-300"
      onClick={() => open('search')}
    >
      <span className="sr-only">Search</span>
      <MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6" />
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
      className="text-sm lg:text-base font-semibold leading-6 text-gray-900 relative lg:hover:!text-main-purple transition duration-300"
    >
      <span className="sr-only">Open cart</span>
      <ShoppingBagIcon aria-hidden="true" className="h-6 w-6" />
      <div className="absolute rounded-full bg-main-purple text-white -bottom-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center">
        {count === null ? <span>&nbsp;</span> : count}
      </div>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
