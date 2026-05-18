import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const ITEMS: { to: string; label: string }[] = [
  { to: '/', label: 'Home' },
  { to: '/works', label: 'Work' },
  { to: '/resources', label: 'Shop' },
  { to: '/playground', label: 'Play' },
  { to: '/careers', label: 'Careers' }
];

/**
 * Mobile/tablet bottom dock. Text-only labels in a tight glass capsule, with
 * a sliding black pill marking the active route — black on tap, plain on rest.
 * Hidden from md: up where the top Navbar takes over.
 */
export const BottomNav = () => (
  <motion.nav
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 5.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    aria-label="Primary mobile"
    className="md:hidden fixed inset-x-0 z-[100] flex justify-center px-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))]"
  >
    <div
      className={cn(
        'flex items-center rounded-full p-1',
        // Glass — solid enough to read over both light and dark page sections.
        'bg-white/70 supports-[backdrop-filter]:bg-white/55',
        '[backdrop-filter:blur(24px)_saturate(180%)] [-webkit-backdrop-filter:blur(24px)_saturate(180%)]',
        'ring-1 ring-black/10',
        'shadow-[0_14px_40px_-14px_rgba(0,0,0,0.35)]'
      )}
    >
      {ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'relative isolate inline-flex items-center justify-center rounded-full px-3.5 py-2 text-[13px] font-medium leading-none transition-colors duration-200',
              'active:scale-[0.96]',
              isActive ? 'text-white' : 'text-brand-black/70 hover:text-brand-black'
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active-pill"
                  transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                  className="absolute inset-0 -z-10 rounded-full bg-brand-black"
                />
              )}
              <span className="relative">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </motion.nav>
);
