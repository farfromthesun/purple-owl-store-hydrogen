import {Money} from '@shopify/hydrogen';
import {AnimatePresence, motion} from 'framer-motion';

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
    //       <s className="text-gray-400 animate-fade-in-blur-in">
    //         <Money data={compareAtPrice} />
    //       </s>
    //       <div className="badge uppercase self-center animate-fade-in-blur-in">
    //         Sale
    //       </div>
    //     </div>
    //   ) : price ? (
    //     <Money data={price} />
    //   ) : (
    //     <span>&nbsp;</span>
    //   )}
    // </div>
    <div className="flex items-center gap-2">
      {price && (
        <AnimatePresence mode="popLayout">
          <motion.div
            initial={{opacity: 0, filter: 'blur(2px)', x: 10}}
            animate={{opacity: 1, filter: 'blur(0)', x: 0}}
            exit={{opacity: 0, filter: 'blur(2px)', x: -10}}
            transition={{duration: 0.2, ease: 'easeOut'}}
            key={'price' + price.amount}
            layout
          >
            <Money data={price} />
          </motion.div>
        </AnimatePresence>
      )}
      <AnimatePresence>
        {compareAtPrice && (
          <motion.div
            layout={motionLayout}
            initial={{opacity: 0, filter: 'blur(2px)'}}
            animate={{opacity: 1, filter: 'blur(0)'}}
            exit={{opacity: 0, filter: 'blur(2px)'}}
            transition={{duration: 0.2, ease: 'easeOut'}}
            className="flex gap-2 items-center"
            style={{originY: '0px'}}
            key="compareAtPrice"
          >
            <AnimatePresence mode="popLayout">
              <motion.s
                initial={{opacity: 0, filter: 'blur(2px)', x: 10}}
                animate={{opacity: 1, filter: 'blur(0)', x: 0}}
                exit={{opacity: 0, filter: 'blur(2px)', x: -10}}
                transition={{duration: 0.2, ease: 'easeOut'}}
                key={'compareAtPrice' + compareAtPrice.amount}
                className="text-gray-400"
                layout
              >
                <Money data={compareAtPrice} />
              </motion.s>
            </AnimatePresence>
            <div className="badge uppercase self-center">Sale</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
