import {Link, useFetcher} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import React, {useRef, useEffect} from 'react';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
} from '~/lib/search';
import {useAside} from './Aside';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Component that renders predictive search results
 * @param {SearchResultsPredictiveProps}
 * @return {React.ReactNode}
 */
export function SearchResultsPredictive({children}) {
  const aside = useAside();
  const {term, inputRef, fetcher, total, items} = usePredictiveSearch();

  /*
   * Utility that resets the search input
   */
  function resetInput() {
    if (inputRef.current) {
      inputRef.current.blur();
      inputRef.current.value = '';
    }
  }

  /**
   * Utility that resets the search input and closes the search aside
   */
  function closeSearch() {
    resetInput();
    aside.close();
  }

  return children({
    items,
    closeSearch,
    inputRef,
    state: fetcher.state,
    term,
    total,
  });
}

SearchResultsPredictive.Articles = SearchResultsPredictiveArticles;
SearchResultsPredictive.Collections = SearchResultsPredictiveCollections;
SearchResultsPredictive.Pages = SearchResultsPredictivePages;
SearchResultsPredictive.Products = SearchResultsPredictiveProducts;
SearchResultsPredictive.Queries = SearchResultsPredictiveQueries;
SearchResultsPredictive.Empty = SearchResultsPredictiveEmpty;

/**
 * @param {PartialPredictiveSearchResult<'articles'>}
 */
function SearchResultsPredictiveArticles({term, articles, closeSearch}) {
  if (!articles.length) return null;

  return (
    <SearchResultsPredictiveCategoryContainer
      category="articles"
      key="articles"
    >
      {articles.map((article) => {
        const articleUrl = urlWithTrackingParams({
          baseUrl: `/blogs/${article.blog.handle}/${article.handle}`,
          trackingParams: article.trackingParameters,
          term: term.current ?? '',
        });

        return (
          <SearchResultsPredictiveItemContainer
            key={article.id}
            url={articleUrl}
            image={article.image}
            title={article.title}
            closeSearch={closeSearch}
          />
        );
      })}
    </SearchResultsPredictiveCategoryContainer>
  );
}

/**
 * @param {PartialPredictiveSearchResult<'collections'>}
 */
function SearchResultsPredictiveCollections({term, collections, closeSearch}) {
  if (!collections.length) return null;

  return (
    <SearchResultsPredictiveCategoryContainer
      category="collections"
      key="collections"
    >
      {collections.map((collection) => {
        const colllectionUrl = urlWithTrackingParams({
          baseUrl: `/collections/${collection.handle}`,
          trackingParams: collection.trackingParameters,
          term: term.current,
        });

        return (
          <SearchResultsPredictiveItemContainer
            key={collection.id}
            url={colllectionUrl}
            image={collection.image}
            title={collection.title}
            closeSearch={closeSearch}
          />
        );
      })}
    </SearchResultsPredictiveCategoryContainer>
  );
}

/**
 * @param {PartialPredictiveSearchResult<'pages'>}
 */
function SearchResultsPredictivePages({term, pages, closeSearch}) {
  if (!pages.length) return null;

  return (
    <SearchResultsPredictiveCategoryContainer category="pages" key="pages">
      {pages.map((page) => {
        const pageUrl = urlWithTrackingParams({
          baseUrl: `/pages/${page.handle}`,
          trackingParams: page.trackingParameters,
          term: term.current,
        });

        return (
          <SearchResultsPredictiveItemContainer
            key={page.id}
            url={pageUrl}
            title={page.title}
            closeSearch={closeSearch}
          />
        );
      })}
    </SearchResultsPredictiveCategoryContainer>
  );
}

/**
 * @param {PartialPredictiveSearchResult<'products'>}
 */
function SearchResultsPredictiveProducts({term, products, closeSearch}) {
  if (!products.length) return null;

  return (
    <SearchResultsPredictiveCategoryContainer
      category="products"
      key="products"
    >
      {products.map((product) => {
        const productUrl = urlWithTrackingParams({
          baseUrl: `/products/${product.handle}`,
          trackingParams: product.trackingParameters,
          term: term.current,
        });

        const image = product?.variants?.nodes?.[0].image;
        return (
          <SearchResultsPredictiveItemContainer
            key={product.id}
            url={productUrl}
            image={image}
            title={product.title}
            closeSearch={closeSearch}
            category="products"
          >
            <small className="text-gray-500">
              {product?.variants?.nodes?.[0].price && (
                <Money data={product.variants.nodes[0].price} />
              )}
            </small>
          </SearchResultsPredictiveItemContainer>
        );
      })}
    </SearchResultsPredictiveCategoryContainer>
  );
}

/**
 * @param {PartialPredictiveSearchResult<'queries', 'inputRef'>}
 */
function SearchResultsPredictiveQueries({queries, inputRef}) {
  if (!queries.length) return null;

  return (
    <div className="predictive-search-result" key="queries">
      <h5>Queries</h5>
      <ul>
        {queries.map((suggestion) => {
          if (!suggestion) return null;

          return (
            <li className="predictive-search-result-item" key={suggestion.text}>
              <div
                role="presentation"
                onClick={() => {
                  if (!inputRef.current) return;
                  inputRef.current.value = suggestion.text;
                  inputRef.current.focus();
                }}
                dangerouslySetInnerHTML={{
                  __html: suggestion?.styledText,
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveCategoryContainer({children, category}) {
  return (
    <div className="mb-8 animate-fade-in">
      <h5 className="capitalize mb-2 font-bold">{category}</h5>
      <ul>{children}</ul>
    </div>
  );
}

function SearchResultsPredictiveItemContainer({
  url,
  image = null,
  title,
  closeSearch,
  children,
  category = null,
}) {
  return (
    <li
      className={classNames(category !== 'products' ? 'mb-2' : 'mb-4', 'flex')}
    >
      <Link to={url} onClick={closeSearch} className="group flex items-center">
        {image && (
          <Image
            alt={image.altText ?? ''}
            src={image.url}
            width={50}
            height={50}
            className="h-full mr-3 rounded-md group-hover:opacity-75 transition duration-300"
          />
        )}
        <div>
          <span
            className={classNames(
              category === 'products'
                ? 'font-semibold group-hover:text-main-purple'
                : 'text-main-purple group-hover:text-main-purple-dark',
              'block text-sm transition duration-300',
            )}
          >
            {title}
          </span>
          {children}
        </div>
      </Link>
    </li>
  );
}

/**
 * @param {{
 *   term: React.MutableRefObject<string>;
 * }}
 */
function SearchResultsPredictiveEmpty({term}) {
  if (!term.current) {
    return null;
  }

  return (
    <p className="mt-3 text-sm text-gray-500 animate-fade-in">
      No results found for <q>{term.current}</q>.
    </p>
  );
}

/**
 * Hook that returns the predictive search results and fetcher and input ref.
 * @example
 * '''ts
 * const { items, total, inputRef, term, fetcher } = usePredictiveSearch();
 * '''
 * @return {UsePredictiveSearchReturn}
 */
function usePredictiveSearch() {
  const fetcher = useFetcher({key: 'search'});
  const term = useRef('');
  const inputRef = useRef(null);

  if (fetcher?.state === 'loading') {
    term.current = String(fetcher.formData?.get('q') || '');
  }

  // capture the search input element as a ref
  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector('input[type="search"]');
    }
  }, []);

  const {items, total} =
    fetcher?.data?.result ?? getEmptyPredictiveSearchResult();

  return {items, total, inputRef, term, fetcher};
}

/** @typedef {PredictiveSearchReturn['result']['items']} PredictiveSearchItems */
/**
 * @typedef {{
 *   term: React.MutableRefObject<string>;
 *   total: number;
 *   inputRef: React.MutableRefObject<HTMLInputElement | null>;
 *   items: PredictiveSearchItems;
 *   fetcher: Fetcher<PredictiveSearchReturn>;
 * }} UsePredictiveSearchReturn
 */
/**
 * @typedef {Pick<
 *   UsePredictiveSearchReturn,
 *   'term' | 'total' | 'inputRef' | 'items'
 * > & {
 *   state: Fetcher['state'];
 *   closeSearch: () => void;
 * }} SearchResultsPredictiveArgs
 */
/**
 * @typedef {Pick<PredictiveSearchItems, ItemType> &
 *   Pick<SearchResultsPredictiveArgs, ExtraProps>} PartialPredictiveSearchResult
 * @template {keyof PredictiveSearchItems} ItemType
 * @template {keyof SearchResultsPredictiveArgs} [ExtraProps='term' | 'closeSearch']
 */
/**
 * @typedef {{
 *   children: (args: SearchResultsPredictiveArgs) => React.ReactNode;
 * }} SearchResultsPredictiveProps
 */

/** @template T @typedef {import('@remix-run/react').Fetcher<T>} Fetcher */
/** @typedef {import('~/lib/search').PredictiveSearchReturn} PredictiveSearchReturn */
