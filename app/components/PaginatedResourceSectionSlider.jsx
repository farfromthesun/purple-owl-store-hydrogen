import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {
  Link,
  useLocation,
  useNavigate,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import {useEffect, useState} from 'react';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 * @param {Class<Pagination<NodesType>>['connection']>}
 */

export function PaginatedResourceSectionSlider({
  connection,
  children,
  resourcesClassName,
  LoadMoreButton,
  setPaginatedNodes,
}) {
  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isLoadingMoreNodes = navigation.location?.search.includes('direction');
  const [sortFilterParamsJoined, setSortFilterParamsJoined] = useState(null);
  const prevLink =
    location.pathname +
    '?' +
    (sortFilterParamsJoined !== null ? sortFilterParamsJoined + '&' : '') +
    'direction=previous&cursor=' +
    connection.pageInfo.startCursor;
  const nextLink =
    location.pathname +
    '?' +
    (sortFilterParamsJoined !== null ? sortFilterParamsJoined + '&' : '') +
    'direction=next&cursor=' +
    connection.pageInfo.endCursor;
  const [isDesktop, setIsDesktop] = useState(false);

  function handlePaginationClick(direction, allowScroll = false) {
    const url =
      direction === 'prev' ? prevLink : direction === 'next' ? nextLink : '';

    const headerMobileHeight = getComputedStyle(
      document.documentElement,
    ).getPropertyValue('--spacing-main-header-mobile-height');
    const headerDesktopHeight = getComputedStyle(
      document.documentElement,
    ).getPropertyValue('--spacing-main-header-desktop-height');

    //selector as a prop (elementToScrollOnLoad)
    //is the callback even needed?

    const element = document.querySelector('#collection-container');
    const headerOffset = isDesktop
      ? parseInt(headerDesktopHeight)
      : parseInt(headerMobileHeight);
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    setTimeout(() => {
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }, 500);

    navigate(url, {
      replace: true,
    });
  }

  useEffect(() => {
    setIsDesktop(
      window.matchMedia('(min-width: 1024px)').matches ? true : false,
    );
  }, []);

  useEffect(() => {
    const sortFilterParams = [...params].filter(
      (param) => param[0] !== 'direction' && param[0] !== 'cursor',
    );
    if (sortFilterParams.length > 0) {
      const sortFilterParamsJoined = sortFilterParams
        .map((param) => param[0] + '=' + encodeURIComponent(param[1]))
        .join('&');
      setSortFilterParamsJoined(sortFilterParamsJoined);
    }
  }, [params]);

  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, state}) => {
        const resoucesMarkup = connection.nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <>
            {connection.nodes.length > 0 ? (
              <div>
                {connection.pageInfo.hasPreviousPage && (
                  <Link
                    to={prevLink}
                    state={state}
                    onClick={() => handlePaginationClick('prev')}
                    preventScrollReset
                  >
                    {LoadMoreButton ? (
                      <LoadMoreButton
                        isLoading={isLoadingMoreNodes}
                        direction="prev"
                        text="Load previous ↑"
                      />
                    ) : isLoadingMoreNodes ? (
                      'Loading...'
                    ) : (
                      <span>↑ Load previous</span>
                    )}
                  </Link>
                )}
                {resourcesClassName ? (
                  <div className={resourcesClassName}>{resoucesMarkup}</div>
                ) : (
                  resoucesMarkup
                )}
                {connection.pageInfo.hasNextPage && (
                  <Link
                    to={nextLink}
                    state={state}
                    onClick={() => handlePaginationClick('next')}
                    preventScrollReset
                  >
                    {LoadMoreButton ? (
                      <LoadMoreButton
                        isLoading={isLoadingMoreNodes}
                        direction="next"
                        text="Load next ↓"
                      />
                    ) : isLoadingMoreNodes ? (
                      'Loading...'
                    ) : (
                      <span>Load next ↓</span>
                    )}
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex justify-center mt-5">
                <span className="text-main-purple-dark font-medium">
                  No products found.
                </span>
              </div>
            )}
          </>
        );
      }}
    </Pagination>
  );
}
