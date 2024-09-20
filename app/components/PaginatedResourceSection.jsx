import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

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
                      isLoading={isLoading}
                      direction="prev"
                      text="↑ Load previous"
                    />
                  ) : isLoading ? (
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
                      isLoading={isLoading}
                      direction="next"
                      text="Load more ↓"
                    />
                  ) : isLoading ? (
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
