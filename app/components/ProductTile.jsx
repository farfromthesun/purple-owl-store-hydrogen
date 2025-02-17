import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {useAnimationControls, motion} from 'framer-motion';
import {useEffect, useState} from 'react';

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
  const controls = useAnimationControls();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(
      window.matchMedia('(min-width: 1200px)').matches ? true : false,
    );
  }, []);

  // const handleMouseEnter = () => {
  //   if (!isDesktop) return;
  //   controls.start({
  //     filter: ['blur(4px)', 'blur(0px)'],
  //     scale: [1.05, 1.05],
  //     transition: {
  //       duration: 0.6,
  //       times: [0.5, 1],
  //       ease: 'easeOut',
  //     },
  //   });
  // };

  // const handleMouseLeave = () => {
  //   if (!isDesktop) return;
  //   controls.start({
  //     filter: ['blur(4px)', 'blur(0px)'],
  //     scale: [1, 1],
  //     transition: {
  //       duration: 0.6,
  //       times: [0.5, 1],
  //       ease: 'easeOut',
  //     },
  //   });
  // };

  const handleMouseEnter = () => {
    if (!isDesktop) return;
    controls.start({
      filter: ['blur(4px)', 'blur(4px)', 'blur(0px)', 'blur(0px)'],
      scale: [1.05, 1.05, 1.05, 1.05],
      transition: {
        duration: 0.7,
        times: [0.25, 0.5, 0.75, 1],
        ease: 'easeOut',
      },
    });
  };

  const handleMouseLeave = () => {
    if (!isDesktop) return;
    controls.start({
      filter: ['blur(4px)', 'blur(4px)', 'blur(0px)', 'blur(0px)'],
      scale: [1, 1, 1, 1],
      transition: {
        duration: 0.7,
        times: [0.25, 0.5, 0.75, 1],
        ease: 'easeOut',
      },
    });
  };

  return (
    <Link
      key={product.id}
      to={to || `/products/${product.handle}`}
      prefetch="intent"
      className="group opacity-0 invisible animate-fade-slide-v-blur-in-longer"
      style={{animationDelay: (index % animationDelayModulo) * 100 + 'ms'}}
      preventScrollReset
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {product.featuredImage && (
        <div className="relative aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
          <motion.div
            animate={controls}
            className="transition ease-[ease] duration-300"
          >
            <Image
              animate={controls}
              alt={product.featuredImage.altText || product.title}
              data={product.featuredImage}
              aspectRatio="1/1"
              loading={imgLoading || 'eager'}
              sizes="(min-width: 45em) 400px, 50vw"
              className="h-full w-full object-cover object-center"
            />
          </motion.div>
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
