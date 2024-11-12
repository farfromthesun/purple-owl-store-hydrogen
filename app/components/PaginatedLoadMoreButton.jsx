import {SpinningCircleIcon} from './SpinningCircleIcon';
import {AnimatePresence, motion} from 'framer-motion';

export function PaginatedLoadMoreButton({isLoading, direction, text}) {
  return (
    <div
      className={`button flex justify-center animate-fade-slide-v-in ${
        direction === 'prev' ? 'mb-6' : direction === 'next' ? 'mt-6' : ''
      }`}
    >
      <AnimatePresence mode="wait" initial={false} key="atcButton">
        <motion.span
          key={isLoading ? 'loading' : 'idle'}
          initial={{x: 20, opacity: 0}}
          animate={{x: 0, opacity: 1}}
          exit={{x: -20, opacity: 0}}
          transition={{duration: 0.2, ease: 'backInOut'}}
          className="flex"
        >
          {isLoading ? (
            <>
              <SpinningCircleIcon classes="-ml-1 mr-2 h-5 w-5 text-white" />
              <span>Loading...</span>
            </>
          ) : (
            text
          )}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
