import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, useLocation} from '@remix-run/react';
import {Suspense, useEffect, useState} from 'react';
import {HomepageHero} from '~/components/HomepageHero';
import {ProductTile} from '~/components/ProductTile';
import {ProductTileSkeleton} from '~/components/ProductTileSkeleton';
import {RouteTransition} from '~/components/RouteTransition';
import {seoPayload} from '~/lib/seo.server';
import {getSeoMeta} from '@shopify/hydrogen';

// /**
//  * @type {MetaFunction}
//  */
// export const meta = ({data}) => {
//   return [{title: 'Home | Purple Owl Store'}];
// };

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
  const {shop} = criticalData;
  const url = args.request.url;

  return defer({
    ...deferredData,
    ...criticalData,
    seo: seoPayload.home({shop, url}),
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [{shop}] = await Promise.all([
    context.storefront.query(SHOP_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    shop,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  // const featuredProducts = context.storefront
  //   .query(FEATURED_PRODUCTS_QUERY, {
  //     variables: {
  //       query: 'tag:homepageFeatured',
  //     },
  //   })
  //   .catch((error) => {
  //     // Log query errors, but don't throw them so the page can still render
  //     console.error(error);
  //     return null;
  //   });

  // const featuredProducts = new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(
  //       context.storefront
  //         .query(FEATURED_PRODUCTS_QUERY, {
  //           variables: {
  //             query: 'tag:homepageFeatured',
  //           },
  //         })
  //         .catch((error) => {
  //           // Log query errors, but don't throw them so the page can still render
  //           console.error(error);
  //           return null;
  //         }),
  //     );
  //   }, 3000);
  // });

  const featuredProducts = Promise.all([
    context.storefront
      .query(FEATURED_PRODUCTS_QUERY, {
        variables: {
          query: 'tag:homepageFeatured',
        },
      })
      .catch((error) => {
        // Log query errors, but don't throw them so the page can still render
        console.error(error);
        return null;
      }),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]).then(([featuredProducts]) => {
    return featuredProducts;
  });

  return {
    featuredProducts,
  };
}

export const meta = ({matches}) => {
  return getSeoMeta(...matches.map((match) => match.data?.seo));
};

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const location = useLocation();
  const data = useLoaderData();
  const [dataState, setDataState] = useState(useLoaderData() || {});

  useEffect(() => {
    if (location.pathname === '/') {
      setDataState(data);
    }
  }, [data, location]);

  return (
    // <RouteTransition>
    <div className="home">
      <HomepageHero />
      <RecommendedProducts products={dataState.featuredProducts} />
    </div>
    // </RouteTransition>
  );
}

function RecommendedProducts({products}) {
  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-2xl lg:max-w-1400 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
            Recommended Products
          </h2>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {Array.from({length: 8}, (_, index) => index + 1).map(
                  (id, index) => (
                    <ProductTileSkeleton
                      key={id}
                      index={index}
                      animationDelayModulo={8}
                    />
                  ),
                )}
              </div>
            }
          >
            <Await resolve={products}>
              {(response) => (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                  {response
                    ? response.products.nodes.map((product, index) => (
                        <ProductTile
                          key={product.id}
                          product={product}
                          withFilters={false}
                          index={index}
                          animationDelayModulo={8}
                        />
                      ))
                    : null}
                </div>
              )}
            </Await>
          </Suspense>
        </div>
      </div>
    </>
  );
}

const FEATURED_PRODUCTS_FRAGMENT = `#graphql
  fragment FeaturedProductItem on Product {
    id
    title
    handle
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      altText
      url
      width
      height
    }
  }
`;

const FEATURED_PRODUCTS_QUERY = `#graphql
  ${FEATURED_PRODUCTS_FRAGMENT}
  query HomepageFeaturedProducts($country: CountryCode, $language: LanguageCode, $query: String!)
    @inContext(country: $country, language: $language) {
    products(first: 8, query: $query) {
      nodes {
        ...FeaturedProductItem
      }
    }
  }
`;

export const SHOP_QUERY = `#graphql
  query Shop(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    shop {
      name
      description
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
