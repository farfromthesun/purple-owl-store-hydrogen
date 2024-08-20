import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData} from '@remix-run/react';
import {Suspense} from 'react';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `${data?.page.title ?? ''} | Purple Owl Store`}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, params}) {
  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: 'about',
      },
    }),
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return {
    page,
  };
}

function loadDeferredData({context}) {
  const homepageFeaturedProducts = context.storefront
    .query(HOMEPAGE_FEATURED_COLLECTION_QUERY, {
      variables: {
        handle: 'homepage-featured-products',
      },
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  const homepageFeaturedProductsWithTag = context.storefront
    .query(HOMEPAGE_FEATURED_TAG_GUERY, {
      variables: {
        query: 'tag:homepageFeatured',
      },
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    homepageFeaturedProducts,
    homepageFeaturedProductsWithTag,
    //homepageFeaturedCollection
  };
}

export default function Page() {
  /** @type {LoaderReturnData} */
  const {page, homepageFeaturedProducts, homepageFeaturedProductsWithTag} =
    useLoaderData();

  return (
    <div className="page">
      <header>
        <h1>{page.title} dedicated route</h1>
      </header>
      <main>
        <Suspense fallback={<p>Loading...</p>}>
          <Await resolve={homepageFeaturedProducts}>
            {({collection}) => (
              <>
                <p>{collection.title}</p>
                <div>
                  {collection.products.nodes.map((product) => (
                    <p key={product.id}>{product.title}</p>
                  ))}
                </div>
              </>
            )}
          </Await>
        </Suspense>
        <Suspense fallback={<p>Loading...</p>}>
          <Await resolve={homepageFeaturedProductsWithTag}>
            {({products}) => (
              <>
                <p>
                  <strong>
                    Products with tag &quot;homepageFeatured&quot;
                  </strong>
                </p>
                <div>
                  {products.nodes.map((product) => (
                    <p key={product.id}>{product.title}</p>
                  ))}
                </div>
              </>
            )}
          </Await>
        </Suspense>
      </main>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      title,
      handle
    }
  }
`;

const HOMEPAGE_FEATURED_COLLECTION_QUERY = `#graphql
  query HomepageFeaturedCollection($handle: String!) {
    collection(handle: $handle) {
      title
      products(first: 8) {
        nodes {
          title
          id
        }
      }
    }
  }
`;

const HOMEPAGE_FEATURED_TAG_GUERY = `#graphql
  query HomepageFeaturedTag($query: String!) {
    products(first: 10, query: $query) {
      nodes {
        title,
        id
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
