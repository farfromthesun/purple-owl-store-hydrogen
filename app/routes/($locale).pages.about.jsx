import {defer} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {PageHero} from '~/components/PageHero';
import {getSeoMeta, Image} from '@shopify/hydrogen';
import {RouteTransition} from '~/components/RouteTransition';
import {seoPayload} from '~/lib/seo.server';

// /**
//  * @type {MetaFunction<typeof loader>}
//  */
// export const meta = ({data}) => {
//   return [
//     {
//       title: `${data?.page.title ?? ''} | Purple Owl Store`,
//     },
//     {
//       name: 'description',
//       content: data?.page.seo.description ?? '',
//     },
//   ];
// };

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
  const {page, shop} = criticalData;
  const url = args.request.url;

  return defer({
    ...deferredData,
    ...criticalData,
    seo: seoPayload.page({shop, page, url}),
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params}) {
  const handle = 'about';

  const [{page, shop}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response(`Page "${handle}" not found`, {status: 404});
  }

  return {
    page,
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
  return {};
}

export const meta = ({matches}) => {
  return getSeoMeta(...matches.map((match) => match.data?.seo));
};

export default function Page() {
  /** @type {LoaderReturnData} */
  const {page} = useLoaderData();

  return (
    <RouteTransition>
      <div className="page">
        <PageHero
          title={page.title}
          subtitle="Step inside and discover who we are."
        />
        <OurStory />
        <OurTeam />
      </div>
    </RouteTransition>
  );
}

function OurStory() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28 lg:max-w-1400 lg:px-8">
      <div className="lg:max-w-4xl">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Our story
        </h2>
        <p className="mt-4 text-gray-500">
          The walnut wood card tray is precision milled to perfectly fit a stack
          of Focus cards. The powder coated steel divider separates active cards
          from new ones, or can be used to archive important task lists.
        </p>
        <p className="mt-4 text-gray-500">
          The Drawstring Canister is water and tear resistant with durable
          canvas construction. This bag holds up to the demands of daily use
          while keeping your snacks secure. Everything you need, nothing you
          don't. This bag has the simple, contemporary design that enables you
          to tell everyone you know about how essentialism is the only rational
          way to live life. Never lose your snacks again with our patent-pending
          snack stash pocket system. With dedicated pouches for each of your
          snacking needs, the Drawstring Canister unlocks new levels of
          efficiency and convenience.
        </p>
        <p className="mt-4 text-gray-500">
          Our patented padded snack sleeve construction protects your favorite
          treats from getting smooshed during all-day adventures, long shifts at
          work, and tough travel schedules.
        </p>
      </div>
    </div>
  );
}

function OurTeam() {
  const founders = [
    {
      name: 'Leslie Alexander',
      role: 'Co-Founder / CEO',
      imageUrl:
        'https://cdn.shopify.com/s/files/1/0724/6168/0949/files/page-about-founder-1.jpg?v=1729392092',
    },
    {
      name: 'Michael Foster',
      role: 'Co-Founder / CTO',
      imageUrl:
        'https://cdn.shopify.com/s/files/1/0724/6168/0949/files/page-about-founder-2.jpg?v=1729392195',
    },
    {
      name: 'Dries Vincent',
      role: 'Business Relations',
      imageUrl:
        'https://cdn.shopify.com/s/files/1/0724/6168/0949/files/page-about-founder-3.jpg?v=1729392195',
    },
    {
      name: 'Lindsay Walton',
      role: 'Director of Product',
      imageUrl:
        'https://cdn.shopify.com/s/files/1/0724/6168/0949/files/page-about-founder-4.jpg?v=1729392092',
    },
  ];

  return (
    <div className="bg-white pb-24 sm:pb-36 lg:pt-10">
      <div className="mx-auto grid max-w-2xl lg:max-w-1400 gap-x-8 gap-y-20 px-4 sm:px-6 lg:px-8 xl:grid-cols-3">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Meet our Team
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Libero fames augue nisl porttitor nisi, quis. Id ac elit odio vitae
            elementum enim vitae ullamcorper suspendisse.
          </p>
        </div>
        <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
          {founders.map((founder) => (
            <li key={founder.name}>
              <div className="flex items-center gap-x-6">
                {/* <img
                  alt={founder.name}
                  src={founder.imageUrl}
                  className="h-16 w-16 rounded-full"
                /> */}
                <div className="h-16 w-16">
                  <Image
                    alt={founder.name}
                    aspectRatio="1/1"
                    data={{
                      url: founder.imageUrl,
                    }}
                    loading="lazy"
                    sizes="(min-width: 45em) 50vw, 100vw"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">
                    {founder.name}
                  </h3>
                  <p className="text-sm font-semibold leading-6 text-main-purple">
                    {founder.role}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
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
    },
    shop {
      name
      description
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
