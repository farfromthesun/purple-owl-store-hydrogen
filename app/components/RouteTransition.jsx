import {easeInOut, motion} from 'framer-motion';

export function RouteTransition({children}) {
  return (
    <motion.div
      initial={{opacity: 0, scale: 1.01}}
      animate={{opacity: 1, scale: 1}}
      // exit={{opacity: 0}}
      transition={{duration: 0.3, ease: easeInOut}}
    >
      {children}
    </motion.div>
  );
}
