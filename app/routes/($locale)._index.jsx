import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {HomepageHero} from '~/components/HomepageHero';
import {ProductTile} from '~/components/ProductTile';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Home | Purple Owl Store'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  return {};
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

  const featuredProducts = new Promise((resolve) => {
    setTimeout(() => {
      resolve(
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
      );
    }, 3000);
  });

  return {
    featuredProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      <HomepageHero />
      <RecommendedProducts products={data.featuredProducts} />
    </div>
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

          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={products}>
              {(response) => (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                  {response
                    ? response.products.nodes.map((product) => (
                        <ProductTile
                          key={product.id}
                          product={product}
                          withFilters={false}
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
    priceRange {
      minVariantPrice {
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

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
