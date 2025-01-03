import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, NavLink} from '@remix-run/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  const [animationsState, setAnimationsState] = useState({
    blur: 0,
    translateY: 0,
    opacity: 0,
  });
  const footerRef = useRef(null);
  const [animationMinHeight, setAnimationMinHeight] = useState(false);

  useEffect(() => {
    setAnimationMinHeight(
      window.matchMedia('(min-height: 900px)').matches ? true : false,
    );
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setAnimationsState({
          blur: 0,
          translateY: 0,
          opacity: 0,
        });
        return;
      }
      const footer = footerRef.current;
      if (!footer) return;
      const blurBase = 8;
      const blurDivider = footer.offsetHeight / blurBase;
      const opacityBase = footer.offsetHeight;

      const treshhold =
        window.scrollY + window.innerHeight >=
        document.body.scrollHeight - footer.offsetHeight;

      if (treshhold) {
        const scrollActionRange =
          document.body.scrollHeight - (window.scrollY + window.innerHeight);
        setAnimationsState({
          blur: scrollActionRange / blurDivider,
          translateY: (scrollActionRange / blurDivider) * 10,
          opacity: scrollActionRange / opacityBase,
        });
      }
    };

    window.addEventListener('scroll', handleScroll);

    //Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer
            className={classNames(
              animationMinHeight && 'sticky',
              'footer text-gray-700 pt-10 lg:pt-14 bg-gray-50 bottom-0 z-[1]',
            )}
            ref={footerRef}
            style={{
              filter: animationMinHeight
                ? `blur(${animationsState.blur}px)`
                : 'none',
              transform: animationMinHeight
                ? `translateY(${animationsState.translateY}px)`
                : 'none',
              opacity: animationMinHeight ? 1 - animationsState.opacity : 1,
            }}
          >
            {footer?.menu && header.shop.primaryDomain?.url && (
              <FooterMenu
                menu={footer.menu}
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              />
            )}
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  return (
    <div className="max-w-2xl lg:max-w-1400 mx-auto py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
      <div>
        <nav
          className="footer-menu mb-20 md:mb-16 flex flex-col gap-8 items-center lg:flex-row lg:items-start lg:gap-14"
          role="navigation"
        >
          {menu.items.map((item) => {
            if (!item.url) return null;
            // if the url is internal, we strip the domain
            const url =
              item.url.includes('myshopify.com') ||
              item.url.includes(publicStoreDomain) ||
              item.url.includes(primaryDomainUrl)
                ? new URL(item.url).pathname
                : item.url;
            const isExternal = !url.startsWith('/');
            return isExternal ? (
              <a
                href={url}
                key={item.id}
                rel="noopener noreferrer"
                target="_blank"
              >
                {item.title}
              </a>
            ) : (
              <NavLink
                end
                key={item.id}
                prefetch="intent"
                preventScrollReset
                // style={activeLinkStyle}
                to={url}
                className="aria-[current]:text-main-purple lg:hover:text-main-purple-dark transition ease-[ease] duration-300"
              >
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="pt-4 lg:pt-6 border-t-gray-200 border-t text-sm text-center lg:text-left">
        © 2024 <span className="text-main-purple">Purple Owl Store</span>. All
        rights reverved.
      </div>
    </div>
  );
}

// const FALLBACK_FOOTER_MENU = {
//   id: 'gid://shopify/Menu/199655620664',
//   items: [
//     {
//       id: 'gid://shopify/MenuItem/461633060920',
//       resourceId: 'gid://shopify/ShopPolicy/23358046264',
//       tags: [],
//       title: 'Privacy Policy',
//       type: 'SHOP_POLICY',
//       url: '/policies/privacy-policy',
//       items: [],
//     },
//     {
//       id: 'gid://shopify/MenuItem/461633093688',
//       resourceId: 'gid://shopify/ShopPolicy/23358013496',
//       tags: [],
//       title: 'Refund Policy',
//       type: 'SHOP_POLICY',
//       url: '/policies/refund-policy',
//       items: [],
//     },
//     {
//       id: 'gid://shopify/MenuItem/461633126456',
//       resourceId: 'gid://shopify/ShopPolicy/23358111800',
//       tags: [],
//       title: 'Shipping Policy',
//       type: 'SHOP_POLICY',
//       url: '/policies/shipping-policy',
//       items: [],
//     },
//     {
//       id: 'gid://shopify/MenuItem/461633159224',
//       resourceId: 'gid://shopify/ShopPolicy/23358079032',
//       tags: [],
//       title: 'Terms of Service',
//       type: 'SHOP_POLICY',
//       url: '/policies/terms-of-service',
//       items: [],
//     },
//   ],
// };

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
