import {useLocation, useRouteLoaderData} from '@remix-run/react';
import {easeInOut, motion} from 'framer-motion';
import {nanoid} from 'nanoid';

export function RouteTransition({children, key}) {
  const location = useLocation();
  const {header} = useRouteLoaderData('root');

  return (
    <>
      <motion.div
        initial={{opacity: 1, visibility: 'visible'}}
        animate={{opacity: 0, visibility: 'hidden'}}
        transition={{duration: 0.5, ease: easeInOut, delay: 0.7}}
        className="fixed left-0 right-0 top-0 z-[5] flex h-svh flex-col items-center justify-center bg-white"
      >
        <div>
          {header.shop.name
            .replace(' Demo', '')
            .replace(/ /g, '\u00a0')
            .split('')
            .map((letter, index) => (
              <motion.span
                key={nanoid()}
                initial={{opacity: 0, x: 20}}
                animate={{opacity: [0, 1, 1, 0], x: [20, 0, 0, -20]}}
                transition={{
                  duration: 0.8,
                  ease: easeInOut,
                  delay: index * 0.01,
                }}
                className="inline-block text-main-purple font-logo text-2xl lg:text-3xl font-extrabold"
              >
                {letter}
              </motion.span>
            ))}
        </div>
      </motion.div>
      <motion.div
        transition={{duration: 0.7, type: 'spring', bounce: 0.45, delay: 1}}
        initial={{opacity: 0, visibility: 'hidden', y: 30}}
        animate={{opacity: 1, visibility: 'visible', y: 0}}
        exit={{opacity: 0, visibility: 'hidden', y: 30}}
      >
        {children}
      </motion.div>
    </>
    // <div>
    //   <div className="animate-route-transition-bg fixed left-0 right-0 top-0 z-[5] flex h-svh flex-col items-center justify-center bg-white">
    //     <span className="animate-route-transition-logo text-main-purple font-logo text-2xl lg:text-3xl font-extrabold">
    //       {header.shop.name.replace(' Demo', '')}
    //     </span>
    //   </div>
    //   {children}
    // </div>
  );
}
