import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';

/**
 * @param {{
 *   product: ProductItemFragment;
 *   to;
 *   withFilters: true | false;
 *   imgLoading: 'eager' | 'lazy';
 * }}
 */
export function ProductTile({product, to, withFilters, imgLoading}) {
  return (
    <Link
      key={product.id}
      to={to || `/products/${product.handle}`}
      prefetch="intent"
      className="group animate-fade-in"
    >
      {product.featuredImage && (
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
          <Image
            alt={product.featuredImage.altText || product.title}
            data={product.featuredImage}
            aspectRatio="1/1"
            loading={imgLoading || 'eager'}
            sizes="(min-width: 45em) 400px, 50vw"
            className="h-full w-full object-cover object-center group-hover:opacity-75 transition duration-300"
          />
        </div>
      )}
      {withFilters === true ? (
        <h4 className="mt-4 text-sm text-gray-700">{product.title}</h4>
      ) : (
        <h3 className="mt-4 text-sm text-gray-700">{product.title}</h3>
      )}

      <div className="mt-1 text-lg font-medium text-gray-900">
        <Money data={product.priceRange.minVariantPrice} />
      </div>
    </Link>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
