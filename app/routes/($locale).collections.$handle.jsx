import {defer, redirect} from '@shopify/remix-oxygen';
import {
  Await,
  useLoaderData,
  useLocation,
  useNavigation,
} from '@remix-run/react';
import {getPaginationVariables, Analytics, getSeoMeta} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {PageHero} from '~/components/PageHero';
import {
  CollectionSortFilters,
  FILTER_URL_PREFIX,
} from '~/components/CollectionSortFilters';
import {ProductTile} from '~/components/ProductTile';
import {parseAsCurrency} from '~/lib/utils';
import {PaginatedLoadMoreButton} from '~/components/PaginatedLoadMoreButton';
import {Suspense, useEffect, useState} from 'react';
import {ProductTileSkeleton} from '~/components/ProductTileSkeleton';
import {RouteTransition} from '~/components/RouteTransition';
import {seoPayload} from '~/lib/seo.server';

// /**
//  * @type {MetaFunction<typeof loader>}
//  */
// export const meta = ({data}) => {
//   return [
//     {
//       title: `${
//         data?.collectionBasicInfo?.title ?? ''
//       } Collection | Purple Owl Store`,
//     },
//   ];
// };

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);
  const {collectionProducts} = deferredData;

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
  const {shop, collectionBasicInfo} = criticalData;
  const url = args.request.url;

  return defer({
    ...deferredData,
    ...criticalData,
    seo: seoPayload.collection({
      shop,
      collection: collectionBasicInfo,
      collectionProducts,
      url,
    }),
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 9,
  });
  const locale = context.storefront.i18n;

  if (!handle) {
    throw redirect('/');
  }

  const searchParams = new URL(request.url).searchParams;

  const {sortKey, reverse} = getSortValuesFromParam(searchParams.get('sort'));

  const filters = [...searchParams.entries()].reduce(
    (filters, [key, value]) => {
      if (key.startsWith(FILTER_URL_PREFIX)) {
        if (key.includes('.price')) {
          if (value && !isNaN(Number(value))) {
            const filterKey = key.split('.')[2];
            if (filters.some((filter) => 'price' in filter)) {
              filters = filters.map((filter) => {
                if (filter.price) {
                  return {
                    price: {
                      ...filter.price,
                      [filterKey]: JSON.parse(value),
                    },
                  };
                } else {
                  return filter;
                }
              });
            } else {
              filters.push({
                price: {
                  [filterKey]: JSON.parse(value),
                },
              });
            }
          }
        } else {
          const filterKey = key.substring(FILTER_URL_PREFIX.length);
          filters.push({
            [filterKey]: JSON.parse(value),
          });
        }
      }
      return filters;
    },
    [],
  );

  const [{collectionBasicInfo, shop}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, filters, sortKey, reverse, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  // const collectionBasicInfo = await storefront.query(COLLECTION_QUERY, {
  //   variables: {handle, filters, sortKey, reverse, ...paginationVariables},
  //   // Add other queries here, so that they are loaded in parallel
  // });

  if (!collectionBasicInfo) {
    throw new Response(`Collection "${handle}" not found`, {
      status: 404,
    });
  }

  const allFilterValues = collectionBasicInfo.products.filters.flatMap(
    (filter) => filter.values,
  );

  const appliedFilters = filters
    .map((filter) => {
      const foundValue = allFilterValues.find((value) => {
        const valueInput = JSON.parse(value.input);
        // special case for price, the user can enter something freeform (still a number, though)
        // that may not make sense for the locale/currency.
        // Basically just check if the price filter is applied at all.
        if (valueInput.price && filter.price) {
          return true;
        }
        return (
          // This comparison should be okay as long as we're not manipulating the input we
          // get from the API before using it as a URL param.
          JSON.stringify(valueInput) === JSON.stringify(filter)
        );
      });
      if (!foundValue) {
        // eslint-disable-next-line no-console
        console.error('Could not find filter value for filter', filter);
        return null;
      }

      if (foundValue.id === 'filter.v.price') {
        // Special case for price, we want to show the min and max values as the label.
        const input = JSON.parse(foundValue.input);
        // const min = input.price?.min ?? 0;
        // const max = input.price?.max ? input.price.max : '';
        const min = parseAsCurrency(input.price?.min ?? 0, locale);
        const max = input.price?.max
          ? parseAsCurrency(input.price.max, locale)
          : '';
        const label = min && max ? `${min} - ${max}` : 'Price';

        return {
          filter,
          label,
        };
      }
      return {
        filter,
        label: foundValue.label,
      };
    })
    .filter((filter) => filter !== null);

  return {
    collectionBasicInfo,
    appliedFilters,
    shop,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 9,
  });

  if (!handle) {
    throw redirect('/');
  }

  const searchParams = new URL(request.url).searchParams;

  const {sortKey, reverse} = getSortValuesFromParam(searchParams.get('sort'));

  const filters = [...searchParams.entries()].reduce(
    (filters, [key, value]) => {
      if (key.startsWith(FILTER_URL_PREFIX)) {
        if (key.includes('.price')) {
          if (value && !isNaN(Number(value))) {
            const filterKey = key.split('.')[2];
            if (filters.some((filter) => 'price' in filter)) {
              filters = filters.map((filter) => {
                if (filter.price) {
                  return {
                    price: {
                      ...filter.price,
                      [filterKey]: JSON.parse(value),
                    },
                  };
                } else {
                  return filter;
                }
              });
            } else {
              filters.push({
                price: {
                  [filterKey]: JSON.parse(value),
                },
              });
            }
          }
        } else {
          const filterKey = key.substring(FILTER_URL_PREFIX.length);
          filters.push({
            [filterKey]: JSON.parse(value),
          });
        }
      }
      return filters;
    },
    [],
  );

  const collectionProducts = Promise.all([
    storefront
      .query(COLLECTION_PRODUCTS_QUERY, {
        variables: {
          handle,
          filters,
          sortKey,
          reverse,
          ...paginationVariables,
        },
      })
      .catch((error) => {
        // Log query errors, but don't throw them so the page can still render
        console.error(error);
        return null;
      }),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]).then(([{collectionProducts}]) => {
    return collectionProducts;
  });

  return {
    collectionProducts,
  };
}

export const meta = ({matches}) => {
  return getSeoMeta(...matches.map((match) => match.data?.seo));
};

export default function Collection() {
  /** @type {LoaderReturnData} */
  // const {collectionBasicInfo, collectionProducts, appliedFilters} =
  //   useLoaderData();
  const loaderData = useLoaderData();
  const [
    {collectionBasicInfo, collectionProducts, appliedFilters},
    setLoaderDataState,
  ] = useState(loaderData || {});
  const navigation = useNavigation();
  const location = useLocation();
  const areProductsLoading =
    navigation.state === 'loading' &&
    navigation.location?.pathname?.includes(collectionBasicInfo.handle) &&
    navigation.location?.state === null;

  useEffect(() => {
    if (location.pathname.includes(collectionBasicInfo.handle)) {
      setLoaderDataState(loaderData);
    }
  }, [loaderData, location, collectionBasicInfo]);

  return (
    // <RouteTransition>
    <div className="collection">
      <PageHero
        title={collectionBasicInfo.title}
        subtitle="Shop the best products available on the market."
        pageType="collection"
      />
      <CollectionSortFilters
        filters={collectionBasicInfo.products.filters}
        appliedFilters={appliedFilters}
      >
        {areProductsLoading ? (
          <ProductTileSkeletonGrid />
        ) : (
          <Suspense fallback={<ProductTileSkeletonGrid />}>
            <Await resolve={collectionProducts}>
              {(collectionProducts) => (
                <PaginatedResourceSection
                  connection={collectionProducts.products}
                  resourcesClassName="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3 xl:gap-x-8"
                  LoadMorebutton={PaginatedLoadMoreButton}
                >
                  {({node: product, index}) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      loading={index < 9 ? 'eager' : undefined}
                      index={index}
                    />
                  )}
                </PaginatedResourceSection>
              )}
            </Await>
          </Suspense>
        )}
      </CollectionSortFilters>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collectionBasicInfo.id,
            handle: collectionBasicInfo.handle,
          },
        }}
      />
    </div>
    // </RouteTransition>
  );
}

/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({product, loading, index}) {
  const variant = product.variants.nodes[0];
  const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
  return (
    <ProductTile
      to={variantUrl}
      product={product}
      withFilters={true}
      imgLoading={loading}
      index={index}
    />
  );
}

function ProductTileSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3 xl:gap-x-8">
      {Array.from({length: 6}, (_, index) => index + 1).map((id, index) => (
        <ProductTileSkeleton key={id} index={index} />
      ))}
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    availableForSale
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 1) {
      nodes {
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collectionBasicInfo: collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        description
        title
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
      }
    },
    shop {
      name
      description
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query CollectionProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collectionProducts: collection(handle: $handle) {
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

function getSortValuesFromParam(sortParam) {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
