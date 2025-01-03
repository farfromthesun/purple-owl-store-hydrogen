import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, Link, NavLink} from '@remix-run/react';
import {useAnalytics} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  UserIcon,
  UserCircleIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import {nanoid} from 'nanoid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  const [isDarkBelow, setIsDarkBelow] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const headerHeight = headerRef.current?.offsetHeight;

    const handleScroll = () => {
      if (window.scrollY === 0) {
        setIsDarkBelow(false);
        return;
      }
      const darkSections = document.querySelectorAll('[data-dark="true"]');
      darkSections.forEach((section) => {
        const sectionRect = section.getBoundingClientRect();
        const inPosition =
          sectionRect.top <= headerHeight / 2 &&
          sectionRect.top > 0 - (sectionRect.height - headerHeight / 2);

        inPosition ? setIsDarkBelow(true) : setIsDarkBelow(false);
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header
        ref={headerRef}
        className="main-header bg-white/10 sticky top-0 z-10 backdrop-blur-[20px]"
      >
        <div className="flex items-center justify-between p-6 lg:px-8 max-w-2xl lg:max-w-1400 m-auto">
          <div className="flex lg:flex-1 order-3 lg:order-1">
            <NavLink
              prefetch="intent"
              to="/"
              className="-m-1.5 p-1.5"
              end
              preventScrollReset
            >
              <strong
                className={classNames(
                  isDarkBelow ? 'text-main-purple-light' : 'text-main-purple',
                  ' font-logo text-lg lg:text-3xl font-extrabold transition-colors duration-300',
                )}
              >
                {shop.name.replace(' Demo', '')}
              </strong>
            </NavLink>
          </div>
          <div className="flex gap-4 order-1">
            <div className="flex lg:hidden">
              <HeaderMenuMobileToggle isDarkBelow={isDarkBelow} />
            </div>
            <div className="lg:hidden">
              <SearchToggle isDarkBelow={isDarkBelow} />
            </div>
          </div>
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            publicStoreDomain={publicStoreDomain}
            isDarkBelow={isDarkBelow}
          />
          <HeaderCtas
            isLoggedIn={isLoggedIn}
            cart={cart}
            isDarkBelow={isDarkBelow}
          />
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
  isDarkBelow,
}) {
  // const className = `header-menu-${viewport}`;
  const {close} = useAside();

  function closeAside(event) {
    close();
    if (viewport === 'mobile') {
      // event.preventDefault();
      // window.location.href = event.currentTarget.href;
    }
  }

  return (
    // <nav className={className} role="navigation">
    <nav
      className={classNames(
        viewport === 'mobile' && '-translate-y-main-header-mobile-height',
        viewport === 'desktop' && 'hidden',
        'lg:flex lg:gap-x-12 lg:order-2',
      )}
      role="navigation"
    >
      {/* {viewport === 'mobile' && (
        <NavLink end onClick={closeAside} prefetch="intent" to="/">
          Home
        </NavLink>
      )} */}
      {menu.items.map((item, itemIdx) => {
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
            key={item.id}
            onClick={closeAside}
            prefetch="intent"
            to={url}
            preventScrollReset
            end
            className={classNames(
              'block text-xl leading-7 font-semibold lg:py-2 lg:px-1 lg:text-base lg:leading-4 transition-colors duration-400 ease-out group',
              isDarkBelow
                ? 'text-gray-100 aria-[current]:text-main-purple-light'
                : 'text-gray-900 aria-[current]:text-main-purple',
              viewport === 'mobile' &&
                'mt-14 first:mt-0 opacity-0 invisible animate-fade-slide-v-blur-in-longer',
            )}
            style={{animationDelay: itemIdx * 100 + 200 + 'ms'}}
          >
            <div className="relative overflow-hidden">
              <span className="block">
                {item.title.split('').map((letter, index) => (
                  <span
                    key={letter}
                    className="inline-block lg:group-hover:-translate-y-full lg:group-hover:opacity-0 transition-[translate,_opacity] ease-[ease] duration-400"
                    style={{transitionDelay: index * 0.05 + 's'}}
                  >
                    {letter}
                  </span>
                ))}
              </span>
              <span className="block absolute top-full">
                {item.title.split('').map((letter, index) => (
                  <span
                    key={nanoid()}
                    className="inline-block translate-y-0 opacity-0 lg:group-hover:-translate-y-full lg:group-hover:opacity-100 transition-[translate,_opacity] ease-[ease] duration-400"
                    style={{transitionDelay: index * 0.05 + 's'}}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </div>
            {/* <span className="block lg:group-hover:-translate-y-full lg:group-hover:opacity-0 transition duration-400">
              {item.title}
            </span>
            <span className="block absolute top-full translate-y-0 opacity-0 lg:group-hover:-translate-y-full lg:group-hover:opacity-100 transition duration-400">
              {item.title}
            </span> */}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart, isDarkBelow}) {
  return (
    <nav
      className="flex lg:flex-1 lg:justify-end gap-4 lg:gap-6 order-4 items-center"
      role="navigation"
    >
      {/* <HeaderMenuMobileToggle /> */}
      <NavLink
        prefetch="intent"
        to="/account"
        className="opacity-0 invisible text-sm lg:text-base font-semibold leading-6 text-gray-900 lg:hover:!text-main-purple transition duration-300"
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
        <SearchToggle isDarkBelow={isDarkBelow} />
      </div>
      <CartToggle cart={cart} isDarkBelow={isDarkBelow} />
    </nav>
  );
}

function HeaderMenuMobileToggle({isDarkBelow}) {
  const {open} = useAside();
  return (
    <button
      className={classNames(
        isDarkBelow ? 'text-gray-100' : 'text-gray-900',
        '-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 transition-color duration-300',
      )}
      onClick={() => open('mobile')}
    >
      <span className="sr-only">Open main menu</span>
      <Bars3Icon aria-hidden="true" className="h-6 w-6" />
    </button>
  );
}

function SearchToggle({isDarkBelow}) {
  const {open} = useAside();
  return (
    <button
      className={classNames(
        isDarkBelow
          ? 'text-gray-100 lg:hover:text-main-purple-light'
          : 'text-gray-900 lg:hover:text-main-purple',
        'text-sm lg:text-base font-semibold leading-6 cursor-pointer flex items-center transition duration-300',
      )}
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
function CartBadge({count, isDarkBelow}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <Link
      to="/cart"
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
      className={classNames(
        isDarkBelow
          ? 'text-gray-100 lg:hover:text-main-purple-light'
          : 'text-gray-900 lg:hover:text-main-purple',
        'text-sm lg:text-base font-semibold leading-6 relative transition duration-300',
      )}
    >
      <span className="sr-only">Open cart</span>
      <ShoppingBagIcon aria-hidden="true" className="h-6 w-6" />
      <div className="absolute rounded-full bg-main-purple text-white -bottom-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center">
        {count === null ? <span>&nbsp;</span> : count}
      </div>
    </Link>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart, isDarkBelow}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} isDarkBelow={isDarkBelow} />;
          return (
            <CartBadge
              count={cart.totalQuantity || 0}
              isDarkBelow={isDarkBelow}
            />
          );
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
