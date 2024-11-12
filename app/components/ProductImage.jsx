import {Image} from '@shopify/hydrogen';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function ProductImage({image, aspectRatio}) {
  if (!image) {
    return <div className="product-image" />;
  }
  return (
    <div className="product-image">
      <Image
        alt={image.altText || 'Product Image'}
        aspectRatio={aspectRatio || undefined}
        data={image}
        key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
        className="animate-fade-in rounded-lg object-cover bg-main-purple/15"
      />
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
