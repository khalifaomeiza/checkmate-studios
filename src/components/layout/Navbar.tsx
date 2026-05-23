import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { NAV_LINKS } from '../../lib/navigation';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goContact = () => {
    const jump = () =>
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    if (location.pathname !== '/') {
      navigate('/');
      requestAnimationFrame(() => requestAnimationFrame(jump));
    } else {
      jump();
    }
  };

  return (
    <nav className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-between px-4 py-1.5 w-[92%] sm:w-[90%] bg-white/70 backdrop-blur-md border border-brand-black/10 rounded-full shadow-lg transition-all duration-300 md:top-6 md:px-8 md:py-2.5">
      <NavLink to="/" className="text-base md:text-xl font-medium tracking-tighter cursor-pointer shrink-0">
        checkmate
      </NavLink>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn('hover:opacity-60 transition-opacity', isActive && 'text-brand-orange')
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
      <button
        type="button"
        onClick={goContact}
        className="bg-brand-orange text-white px-4 py-1.5 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm font-medium shrink-0 hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-brand-orange/20"
      >
        Get in touch
      </button>
    </nav>
  );
};
