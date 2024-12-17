import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';

/**
 * @param {{
 *   product: ProductItemFragment;
 *   to;
 *   imgLoading: 'eager' | 'lazy';
 * }}
 */
export function ProductTile({
  product,
  to,
  imgLoading,
  index,
  animationDelayModulo = 9,
}) {
  const isSoldOut = !product.availableForSale;
  const isOnSale =
    product.compareAtPriceRange.minVariantPrice.amount > 0 &&
    product.compareAtPriceRange.maxVariantPrice.amount > 0;

  return (
    <Link
      key={product.id}
      to={to || `/products/${product.handle}`}
      prefetch="intent"
      className="group opacity-0 invisible animate-fade-slide-v-in"
      style={{animationDelay: (index % animationDelayModulo) * 100 + 'ms'}}
      preventScrollReset
    >
      {product.featuredImage && (
        <div className="relative aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
          <Image
            alt={product.featuredImage.altText || product.title}
            data={product.featuredImage}
            aspectRatio="1/1"
            loading={imgLoading || 'eager'}
            sizes="(min-width: 45em) 400px, 50vw"
            className="h-full w-full object-cover object-center group-hover:opacity-75 transition ease-[ease] duration-300"
          />
          {(isSoldOut || isOnSale) && (
            <div className="absolute bottom-2 flex left-2 gap-2">
              {isSoldOut && (
                <span className="badge bg-main-purple-super-dark uppercase">
                  Sold out
                </span>
              )}
              {isOnSale && <span className="badge uppercase">Sale</span>}
            </div>
          )}
        </div>
      )}

      <h3 className="mt-4 text-sm text-gray-700 group-hover:text-main-purple transition duration-300">
        {product.title}
      </h3>

      <div className="flex mt-1 text-lg font-medium text-gray-900 group-hover:text-main-purple transition duration-300">
        <Money data={product.priceRange.minVariantPrice} />
        {product.priceRange.maxVariantPrice.amount >
        product.priceRange.minVariantPrice.amount ? (
          <>
            <span className="mx-2">-</span>
            <Money data={product.priceRange.maxVariantPrice} />
          </>
        ) : (
          ''
        )}
      </div>
    </Link>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
