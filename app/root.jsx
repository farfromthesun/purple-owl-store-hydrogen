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
} from '@remix-run/react';
import favicon from '~/assets/favicon.svg';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import customFonts from './styles/custom-fonts.css?url';
import {PageLayout} from '~/components/PageLayout';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {seoPayload} from './lib/seo.server';
import {useEffect} from 'react';

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
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
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

  useEffect(() => {
    async function getCart() {
      const cart = await data.cart;

      console.log('#####################################');
      cart?.lines?.nodes?.map((line) => {
        console.log('title:', line.merchandise.product.title);
      });
    }

    getCart();
  }, [data.cart]);

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

export default function App() {
  return <Outlet />;
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
