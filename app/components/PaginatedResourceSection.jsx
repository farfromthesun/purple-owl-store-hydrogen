import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {Link, useLocation, useNavigation} from '@remix-run/react';
import {useEffect, useRef} from 'react';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 * @param {Class<Pagination<NodesType>>['connection']>}
 */

export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
  LoadMoreButton,
  setPaginatedNodes,
  collectionBasicInfoHandle,
}) {
  const navigation = useNavigation();
  const location = useLocation();
  const isLoadingMoreNodes = navigation.location?.search.includes('direction');
  const nodesRef = useRef([]);

  // useEffect(() => {
  //   console.log('connection', connection);
  // }, [connection]);

  useEffect(() => {
    if (location.pathname.includes(collectionBasicInfoHandle)) {
      setPaginatedNodes(nodesRef.current);
    }
  }, [
    navigation,
    setPaginatedNodes,
    location.pathname,
    collectionBasicInfoHandle,
  ]);

  return (
    <Pagination connection={connection}>
      {({
        nodes,
        isLoading,
        PreviousLink,
        NextLink,
        hasPreviousPage,
        previousPageUrl,
        state,
      }) => {
        const resoucesMarkup = connection.nodes.map((node, index) =>
          children({node, index}),
        );

        nodesRef.current = nodes;

        return (
          <>
            {nodes.length > 0 ? (
              <div>
                {connection.pageInfo.hasPreviousPage && (
                  <Link
                    to={`${location.pathname}?direction=previous&cursor=${connection.pageInfo.startCursor}`}
                    state={state}
                    preventScrollReset
                  >
                    {LoadMoreButton ? (
                      <LoadMoreButton
                        isLoading={isLoadingMoreNodes}
                        direction="prev"
                        text="↑ Load previous"
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
                <NextLink>
                  {LoadMoreButton ? (
                    <LoadMoreButton
                      isLoading={isLoadingMoreNodes}
                      direction="next"
                      text="Load more ↓"
                    />
                  ) : isLoadingMoreNodes ? (
                    'Loading...'
                  ) : (
                    <span>Load more ↓</span>
                  )}
                </NextLink>
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
