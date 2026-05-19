import { motion } from 'motion/react';
import type { ReactNode } from 'react';

/** Wraps a routed page in the shared fade transition. The Works route opts out
 *  because its GSAP ScrollTrigger pin conflicts with the opacity tween. */
export const PageFade = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);
