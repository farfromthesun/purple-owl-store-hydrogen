import {Suspense, useEffect, useState} from 'react';
import {defer, redirect} from '@shopify/remix-oxygen';
import {Await, Link, useLoaderData, useLocation} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getSeoMeta,
} from '@shopify/hydrogen';
import {getVariantUrl} from '~/lib/variants';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
// import {AnimatePresence, easeInOut, motion} from 'framer-motion';
import {RouteTransition} from '~/components/RouteTransition';
import {seoPayload} from '~/lib/seo.server';
import {SlashIcon} from '@heroicons/react/24/outline';
import {ProductImageSkeleton} from '~/components/ProductImageSkeleton';

// /**
//  * @type {MetaFunction<typeof loader>}
//  */
// export const meta = ({data}) => {
//   return [{title: `${data?.product.title ?? ''} | Purple Owl Store`}];
// };

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
  const {shop, product} = criticalData;
  const url = args.request.url;

  return defer({
    ...deferredData,
    ...criticalData,
    seo: seoPayload.product({
      shop,
      product,
      url,
      selectedVariant: product.selectedVariant,
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

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(`Product "${handle}" not found`, {status: 404});
  }

  const firstVariant = product.variants.nodes[0];
  const firstVariantIsDefault = Boolean(
    firstVariant.selectedOptions.find(
      (option) => option.name === 'Title' && option.value === 'Default Title',
    ),
  );

  if (firstVariantIsDefault) {
    product.selectedVariant = firstVariant;
  } else {
    // if no selected variant was returned from the selected options,
    // we redirect to the first variant's url with it's selected options applied
    if (!product.selectedVariant) {
      throw redirectToFirstVariant({product, request});
    }
  }

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deffered query resolves, the UI will update.
  const variants = context.storefront
    .query(VARIANTS_QUERY, {
      variables: {handle: params.handle},
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    variants,
  };
}

/**
 * @param {{
 *   product: ProductFragment;
 *   request: Request;
 * }}
 */
function redirectToFirstVariant({product, request}) {
  const url = new URL(request.url);
  const firstVariant = product.variants.nodes[0];

  return redirect(
    getVariantUrl({
      pathname: url.pathname,
      handle: product.handle,
      selectedOptions: firstVariant.selectedOptions,
      searchParams: new URLSearchParams(url.search),
    }),
    {
      status: 302,
    },
  );
}

export const meta = ({matches}) => {
  return getSeoMeta(...matches.map((match) => match.data?.seo));
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const loaderData = useLoaderData();
  const [{product, variants}, setLoaderDataState] = useState(
    useLoaderData() || {},
  );
  const location = useLocation();
  // const selectedVariant = useOptimisticVariant(
  //   product.selectedVariant,
  //   variants,
  // );
  const selectedVariant = product.selectedVariant;
  const {title, descriptionHtml} = product;
  const breadcrumbs = [
    {id: 1, name: 'Shop', href: '/collections/all-products'},
  ];
  const isProductGWP = product.id.includes('9201094689077');
  const [imgAspectRatio, setImgAspectRatio] = useState(null);

  useEffect(() => {
    if (location.pathname.includes(product.handle)) {
      setLoaderDataState(loaderData);
    }
  }, [loaderData, location.pathname, product.handle]);

  useEffect(() => {
    setImgAspectRatio(
      window.matchMedia('(min-width: 1024px)').matches ? undefined : '1/1',
    );
  }, []);

  // const mainHeaderHeight = useRef(0);

  // useLayoutEffect(() => {
  //   mainHeaderHeight.current = document
  //     .querySelector('.main-header')
  //     .getBoundingClientRect().height;
  // });

  return (
    // <RouteTransition>
    <div className="bg-white">
      <div className="pt-6 lg:pt-12">
        <nav aria-label="Breadcrumb">
          <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-1400 lg:px-8">
            {breadcrumbs.map((breadcrumb) => (
              <li key={breadcrumb.id}>
                <div className="flex items-center">
                  <Link
                    to={breadcrumb.href}
                    className="mr-2 text-sm font-medium text-gray-900 hover:text-main-purple transition duration-300"
                  >
                    {breadcrumb.name}
                  </Link>
                  <SlashIcon
                    aria-hidden="true"
                    className="h-4 w-4 text-gray-400"
                  />
                </div>
              </li>
            ))}
            <li className="text-sm">
              <span className="font-medium text-main-purple">{title}</span>
            </li>
          </ol>
        </nav>

        {/* Product main */}
        <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6 lg:grid lg:max-w-1400 lg:grid-cols-3 lg:gap-x-8 lg:px-8 lg:pb-24">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            {imgAspectRatio !== null ? (
              <ProductImage
                image={selectedVariant?.image}
                aspectRatio={imgAspectRatio}
              />
            ) : (
              <ProductImageSkeleton />
            )}
          </div>

          {/* Product info */}
          <div className="mt-6 lg:mt-0 sticky top-main-header-desktop-height self-start">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-3">
              {title}
            </h1>
            <div className="text-2xl text-gray-900 flex items-center lg:block xl:flex gap-2">
              {/* <AnimatePresence initial={false}> */}
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
                key="selectedVariantPrice"
              />
              {!selectedVariant.availableForSale && (
                // <motion.span
                //   key="selectedVariantSoldOutBadge"
                //   layout
                //   initial={{opacity: 0}}
                //   animate={{opacity: 1}}
                //   exit={{opacity: 0}}
                //   transition={{duration: 0.1, ease: easeInOut}}
                //   className="badge bg-main-purple-super-dark uppercase"
                // >
                //   Sold out
                // </motion.span>
                <span className="badge bg-main-purple-super-dark uppercase animate-fade-in">
                  Sold out
                </span>
              )}
              {/* </AnimatePresence> */}
            </div>

            {!isProductGWP && (
              <Suspense
                fallback={
                  <ProductForm
                    product={product}
                    selectedVariant={selectedVariant}
                    variants={[]}
                  />
                }
              >
                <Await
                  errorElement="There was a problem loading product variants"
                  resolve={variants}
                >
                  {(data) => (
                    <ProductForm
                      product={product}
                      selectedVariant={selectedVariant}
                      variants={data?.product?.variants.nodes || []}
                    />
                  )}
                </Await>
              </Suspense>
            )}

            <div className="space-y-6 mt-10 lg:mt-12">
              <div
                className="text-base text-gray-900"
                dangerouslySetInnerHTML={{__html: descriptionHtml}}
              />
            </div>
          </div>
        </div>
        <ProductFeatures />
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
    // </RouteTransition>
  );
}

function ProductFeatures() {
  const features = [
    {name: 'Origin', description: 'Designed by Good Goods, Inc.'},
    {
      name: 'Material',
      description:
        'Solid walnut base with rare earth magnets and powder coated steel card cover',
    },
    {name: 'Dimensions', description: '6.25" x 3.55" x 1.15"'},
    {name: 'Finish', description: 'Hand sanded and finished with natural oil'},
    {name: 'Includes', description: 'Wood card tray and 3 refill packs'},
    {
      name: 'Considerations',
      description:
        'Made from natural materials. Grain and color vary with each item.',
    },
  ];

  return (
    <div className="bg-white">
      <section className="mx-auto max-w-2xl px-4 pt-4 pb-24 sm:px-6 sm:pt-6 sm:pb-32 lg:max-w-1400 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Technical Specifications
        </h2>
        <p className="mt-4 text-gray-500">
          The walnut wood card tray is precision milled to perfectly fit a stack
          of Focus cards. The powder coated steel divider separates active cards
          from new ones, or can be used to archive important task lists.
        </p>

        <dl className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="border-t border-gray-200 pt-4">
              <dt className="font-medium text-gray-900">{feature.name}</dt>
              <dd className="mt-2 text-sm text-gray-500">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    quantityAvailable
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    order_limit_metafield: metafield(key: "order_limit", namespace: "custom") {
      value
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    options {
      name
      values
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    add_ons_metafield: metafield(key: "add_ons", namespace: "custom") {
      references(first: 50) {
        nodes {
          ... on Product {
            title
            id
            images(first: 1) {
              nodes {
                url(transform: {crop: CENTER, maxHeight: 200, maxWidth: 200})
              }
            }
            defaultVariant: variantBySelectedOptions(selectedOptions: {name: "Title", value: "Default Title"}, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
              ...ProductVariant
            }
          }
        }
      }
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    },
    shop {
      name
      description
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment ProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query ProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductVariants
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').SelectedOption} SelectedOption */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
