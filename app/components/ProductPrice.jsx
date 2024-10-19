import {Money} from '@shopify/hydrogen';
import {easeInOut, motion} from 'framer-motion';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice, motionLayout = true}) {
  return (
    // <div>
    //   {compareAtPrice ? (
    //     <div className="flex items-center gap-2">
    //       {price ? <Money data={price} /> : null}
    //       <s className="opacity-50">
    //         <Money data={compareAtPrice} />
    //       </s>
    //       <div className="badge uppercase self-center">Sale</div>
    //     </div>
    //   ) : price ? (
    //     <Money data={price} />
    //   ) : (
    //     <span>&nbsp;</span>
    //   )}
    // </div>
    <div className="flex items-center gap-2">
      {price && <Money data={price} />}
      {compareAtPrice && (
        <motion.div
          layout={motionLayout}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.1, ease: easeInOut}}
          className="flex gap-2 items-center"
        >
          <s className="opacity-50">
            <Money data={compareAtPrice} />
          </s>
          <div className="badge uppercase self-center">Sale</div>
        </motion.div>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
