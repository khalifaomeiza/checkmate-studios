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
      // Wait for the home route to mount before scrolling.
      requestAnimationFrame(() => requestAnimationFrame(jump));
    } else {
      jump();
    }
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-between px-8 py-2.5 w-[90%] bg-white/70 backdrop-blur-md border border-brand-black/10 rounded-full shadow-lg transition-all duration-300">
      <NavLink
        to="/"
        className="text-xl font-bold tracking-tighter cursor-pointer"
      >
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
        className="bg-brand-orange text-white px-6 py-2.5 rounded-full text-sm font-medium hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-brand-orange/20"
      >
        Get in touch
      </button>
    </nav>
  );
};
