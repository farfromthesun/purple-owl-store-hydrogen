import {Money} from '@shopify/hydrogen';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice}) {
  return (
    <div className="">
      {compareAtPrice ? (
        <div className="flex gap-2">
          {price ? <Money data={price} /> : null}
          <s className="opacity-50">
            <Money data={compareAtPrice} />
          </s>
          <div className="badge uppercase self-center">Sale</div>
        </div>
      ) : price ? (
        <Money data={price} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
