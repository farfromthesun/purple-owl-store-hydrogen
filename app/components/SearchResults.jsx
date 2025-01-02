import {Link, useNavigation} from '@remix-run/react';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams} from '~/lib/search';
import {PaginatedLoadMoreButton} from './PaginatedLoadMoreButton';
import {ProductTile} from './ProductTile';

/**
 * @param {Omit<SearchResultsProps, 'error' | 'type'>}
 */
export function SearchResults({term, result, children}) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

/**
 * @param {PartialSearchResult<'articles'>}
 */
function SearchResultsArticles({term, articles}) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <SearchResultsCategoryContainer category="articles">
      <div>
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div className="mb-2" key={article.id}>
              <Link
                className="text-main-purple hover:text-main-purple-dark transition duration-300"
                prefetch="intent"
                to={articleUrl}
              >
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </SearchResultsCategoryContainer>
  );
}

/**
 * @param {PartialSearchResult<'pages'>}
 */
function SearchResultsPages({term, pages}) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <SearchResultsCategoryContainer category="pages">
      <ul>
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <li className="mb-3" key={page.id}>
              <Link
                className="text-main-purple hover:text-main-purple-dark transition duration-300"
                prefetch="intent"
                to={pageUrl}
              >
                {page.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </SearchResultsCategoryContainer>
  );
}

/**
 * @param {PartialSearchResult<'products'>}
 */
function SearchResultsProducts({term, products}) {
  const navigation = useNavigation();
  const isLoadingMoreNodes = navigation.location?.search.includes('direction');
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <SearchResultsCategoryContainer category="products">
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product, index) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            return (
              <ProductTile
                to={productUrl}
                key={product.id}
                product={product}
                index={index}
                animationDelayModulo={12}
              />
            );
          });

          return (
            <div>
              <PreviousLink>
                <PaginatedLoadMoreButton
                  isLoading={isLoadingMoreNodes}
                  direction="prev"
                  text="↑ Load previous"
                />
                {/* {isLoading ? 'Loading...' : <span>↑ Load previous</span>} */}
              </PreviousLink>
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 xl:gap-x-8">
                {ItemsMarkup}
              </div>
              <NextLink>
                <PaginatedLoadMoreButton
                  isLoading={isLoadingMoreNodes}
                  direction="next"
                  text="Load more ↓"
                />
                {/* {isLoading ? 'Loading...' : <span>Load more ↓</span>} */}
              </NextLink>
            </div>
          );
        }}
      </Pagination>
    </SearchResultsCategoryContainer>
  );
}

function SearchResultsCategoryContainer({children, category}) {
  return (
    <section className="mb-8 lg:mb-12 animate-fade-in-blur-in last:mb-0">
      <h2 className="capitalize mb-3 lg:text-xl font-bold">{category}</h2>
      {children}
    </section>
  );
}

function SearchResultsEmpty() {
  return (
    <p className="mt-10 text-gray-500 animate-fade-in-blur-in text-center">
      No results, try a different search.
    </p>
  );
}

/** @typedef {RegularSearchReturn['result']['items']} SearchItems */
/**
 * @typedef {Pick<
 *   SearchItems,
 *   ItemType
 * > &
 *   Pick<RegularSearchReturn, 'term'>} PartialSearchResult
 * @template {keyof SearchItems} ItemType
 */
/**
 * @typedef {RegularSearchReturn & {
 *   children: (args: SearchItems & {term: string}) => React.ReactNode;
 * }} SearchResultsProps
 */

/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
