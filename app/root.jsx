import {
  useNonce,
  getShopAnalytics,
  Analytics,
  getSeoMeta,
} from '@shopify/hydrogen';
import {defer} from '@shopify/remix-oxygen';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
  useRouteLoaderData,
  ScrollRestoration,
  isRouteErrorResponse,
  Link,
  useOutlet,
  useLocation,
} from '@remix-run/react';
// import favicon from '~/assets/favicon.svg';

import faviconAppleTouch from '~/assets/favicon/apple-touch-icon.png';
import favicon32 from '~/assets/favicon/favicon-32x32.png';
import favicon16 from '~/assets/favicon/favicon-16x16.png';
import faviconIco from '~/assets/favicon/favicon.ico';

import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import customFonts from './styles/custom-fonts.css?url';
import {PageLayout} from '~/components/PageLayout';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {seoPayload} from './lib/seo.server';
import {AnimatePresence, motion} from 'framer-motion';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({
  formMethod,
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  return defaultShouldRevalidate;
};

export function links() {
  return [
    {rel: 'stylesheet', href: customFonts},
    {rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css'},
    {rel: 'stylesheet', href: tailwindCss},
    // {rel: 'stylesheet', href: resetStyles},
    // {rel: 'stylesheet', href: appStyles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    // {rel: 'icon', type: 'image/svg+xml', href: favicon},

    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: faviconAppleTouch,
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: favicon32,
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: favicon16,
    },
    {rel: 'icon', type: 'image/x-icon', href: faviconIco},
  ];
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
  const shop = criticalData.header.shop;
  const url = args.request.url;

  const {storefront, env} = args.context;

  return defer({
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    },
    // seo: {
    //   title: name,
    //   titleTemplate: `%s | ${name}`,
    //   description,
    //   url: args.request.url,
    // },
    seo: seoPayload.root({shop, url}),
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu-hydrogen', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    header,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer-menu-hydrogen', // Adjust to your footer menu handle
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export const meta = ({data}) => {
  return getSeoMeta(data.seo);
};

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-svh flex flex-col">
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <PageLayout {...data}>{children}</PageLayout>
          </Analytics.Provider>
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function App() {
  const outlet = useOutlet();
  const location = useLocation();
  const {header} = useRouteLoaderData('root');

  return (
    <AnimatePresence mode="wait" initial={false}>
      <div key={location.pathname}>
        <div className="fixed top-main-header-desktop-height left-0 h-full w-full z-50 grid grid-cols-2 grid-rows-2 pointer-events-none overflow-hidden">
          <motion.div
            initial={{opacity: 1}}
            animate={{opacity: 0}}
            exit={{opacity: 1}}
            transition={{duration: 0.9, ease: 'easeInOut'}}
            className="absolute top-0 left-0 z-10 h-full w-full bg-gray-900/50"
          />
          {Array.from({length: 4}, (_, index) => index + 1).map((id, index) => (
            <motion.div
              key={location.pathname + id}
              initial={{
                opacity: 1,
                visibility: 'visible',
                x: 0,
                y: 0,
                // scale: 1,
              }}
              animate={{
                opacity: 0,
                visibility: 'hidden',
                x: index % 2 === 0 ? [0, -7] : [0, 7],
                y: index <= 1 ? [0, -7] : [0, 7],
                // scale: [1, 0.98],
                // transition: {duration: 0.5, delay: index * 0.2},
              }}
              exit={{
                opacity: 1,
                visibility: 'visible',
                x: index % 2 === 0 ? [-7, 0] : [7, 0],
                y: index <= 1 ? [-7, 0] : [7, 0],
                // scale: [0.98, 1],
                // transition: {duration: 0.5, delay: index * 0.2},
              }}
              transition={{
                duration: 0.3,
                // type: 'spring',
                // bounce: 0.25,
                ease: 'easeInOut',
                delay: index * 0.2,
              }}
              className="bg-main-purple-super-dark relative overflow-hidden z-20"
            >
              <div
                className={classNames(
                  index === 0 &&
                    'top-full translate-y-[-50%] left-full translate-x-[-50%]',
                  index === 1 &&
                    'top-full translate-y-[-50%] right-full translate-x-[50%]',
                  index === 2 &&
                    'bottom-full translate-y-[50%] left-full translate-x-[-50%]',
                  index === 3 &&
                    'bottom-full translate-y-[50%] right-full translate-x-[50%]',
                  'absolute whitespace-nowrap',
                )}
              >
                <strong className="text-white font-logo text-xl lg:text-4xl font-extrabold">
                  {header.shop.name.replace(' Demo', '')}
                </strong>
              </div>
            </motion.div>
          ))}
        </div>
        {outlet}
      </div>
    </AnimatePresence>
  );

  // return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isRouteError = isRouteErrorResponse(error);
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteError) {
    if (error.data) {
      errorMessage = error?.data?.message ?? error.data;
    } else {
      errorMessage = 'Not Found :(';
    }
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-main-purple">
          {errorStatus}
        </p>

        {isRouteError ? (
          <>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {errorMessage}
            </h1>
            <p className="mt-6 text-sm lg:text-base leading-7 text-gray-600">
              Sorry, we couldn’t find what you’re looking for.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/" className="button">
                Go back home
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-6 text-lg lg:text-xl leading-7 text-gray-900 max-w-xl">
              {errorMessage}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@remix-run/react').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
