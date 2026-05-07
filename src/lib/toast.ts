/**
 * Tiny toast helper — keeps form components free of toast plumbing
 * without pulling in a heavy dependency.
 *
 * Usage: toast.success('Subscribed!') / toast.error('Something went wrong.')
 */

type ToastTone = 'success' | 'error' | 'info';

const colors: Record<ToastTone, string> = {
  success: '#0ea66f',
  error: '#dc2626',
  info: '#050505'
};

const ensureContainer = (): HTMLElement => {
  let container = document.getElementById('checkmate-toasts');
  if (!container) {
    container = document.createElement('div');
    container.id = 'checkmate-toasts';
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      pointerEvents: 'none'
    });
    document.body.appendChild(container);
  }
  return container;
};

const show = (tone: ToastTone, message: string): void => {
  if (typeof document === 'undefined') return;
  const node = document.createElement('div');
  Object.assign(node.style, {
    background: colors[tone],
    color: '#ffffff',
    padding: '14px 18px',
    borderRadius: '12px',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    maxWidth: '360px',
    pointerEvents: 'auto',
    transform: 'translateY(8px)',
    opacity: '0',
    transition: 'opacity .2s ease, transform .2s ease'
  });
  node.textContent = message;

  const container = ensureContainer();
  container.appendChild(node);

  requestAnimationFrame(() => {
    node.style.opacity = '1';
    node.style.transform = 'translateY(0)';
  });

  window.setTimeout(() => {
    node.style.opacity = '0';
    node.style.transform = 'translateY(8px)';
    window.setTimeout(() => node.remove(), 250);
  }, 4000);
};

export const toast = {
  success: (msg: string) => show('success', msg),
  error: (msg: string) => show('error', msg),
  info: (msg: string) => show('info', msg)
};
