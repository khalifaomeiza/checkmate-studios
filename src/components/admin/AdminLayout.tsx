import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Layers, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

const NAV = [
  { to: '/admin/works', label: 'Case studies', icon: Layers },
  { to: '/admin/playground', label: 'Playground', icon: Sparkles },
  { to: '/admin/careers', label: 'Careers', icon: Briefcase },
  { to: '/admin/applications', label: 'Applications', icon: Users }
] as const;

interface Props {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const AdminLayout = ({ title, description, actions, children }: Props) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f6f6f4] pt-20 pb-24 px-4 sm:px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 space-y-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xl font-medium tracking-tighter text-brand-black"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-black text-[10px] font-semibold uppercase tracking-widest text-white">
                  cm
                </span>
                checkmate studio
              </Link>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-2">
                  Admin
                </p>
                <h1 className="text-3xl font-normal tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-none">
                  {title}
                </h1>
                {description ? (
                  <p className="text-gray-500 mt-3 text-sm sm:text-base max-w-2xl">{description}</p>
                ) : null}
                <p className="text-xs text-gray-400 mt-2">Signed in as {profile?.email ?? 'editor'}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <button
                type="button"
                onClick={() => {
                  void signOut().then(() => navigate('/admin/login', { replace: true }));
                }}
                className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:border-brand-orange hover:text-brand-orange"
              >
                Sign out
              </button>
            </div>
          </div>

          <nav
            className="mt-10 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Admin sections"
          >
            {NAV.map(({ to, label, icon: Icon }) => {
              const active =
                location.pathname === to || location.pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-brand-black text-white shadow-lg shadow-brand-black/10'
                      : 'bg-white text-gray-600 border border-black/5 hover:border-brand-orange/40 hover:text-brand-black'
                  )}
                >
                  <Icon size={16} className={cn(active ? 'text-brand-orange' : 'text-gray-400')} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
};

export const adminPrimaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-full bg-brand-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-orange';

export const adminGhostBtn =
  'inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand-orange hover:text-brand-orange';

export const adminFieldClass =
  'w-full rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-brand-orange/25 focus:border-brand-orange/40';

export const adminLabelClass =
  'text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400';
