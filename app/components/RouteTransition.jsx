import {useLocation, useRouteLoaderData} from '@remix-run/react';
import {easeInOut, motion} from 'framer-motion';

export function RouteTransition({children, key}) {
  const location = useLocation();
  const {header} = useRouteLoaderData('root');

  return (
    // <motion.div
    //   key={location.pathname}
    //   initial={{opacity: 0, scale: 1.01}}
    //   animate={{opacity: 1, scale: 1}}
    //   exit={{opacity: 0}}
    //   transition={{duration: 0.3, ease: easeInOut}}
    // >
    //   {children}
    // </motion.div>
    <div>
      <div className="animate-route-transition-bg fixed left-0 right-0 top-0 z-[5] flex h-svh flex-col items-center justify-center bg-white">
        <span className="animate-route-transition-logo text-main-purple font-logo text-2xl lg:text-3xl font-extrabold">
          {header.shop.name.replace(' Demo', '')}
        </span>
      </div>
      {children}
    </div>
  );
}
