import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {useNavigation} from '@remix-run/react';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 * @param {Class<Pagination<NodesType>>['connection']>}
 */

export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
  LoadMorebutton,
}) {
  const navigation = useNavigation();
  const isLoadingMoreNodes = navigation.location?.search.includes('direction');

  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resoucesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <>
            {nodes.length > 0 ? (
              <div>
                <PreviousLink>
                  {LoadMorebutton ? (
                    <LoadMorebutton
                      isLoading={isLoadingMoreNodes}
                      direction="prev"
                      text="↑ Load previous"
                    />
                  ) : isLoadingMoreNodes ? (
                    'Loading...'
                  ) : (
                    <span>↑ Load previous</span>
                  )}
                </PreviousLink>
                {resourcesClassName ? (
                  <div className={resourcesClassName}>{resoucesMarkup}</div>
                ) : (
                  resoucesMarkup
                )}
                <NextLink>
                  {LoadMorebutton ? (
                    <LoadMorebutton
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
