import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const backButtonClassName =
  'group inline-flex items-center gap-2 text-gray-400 hover:text-brand-black transition-colors';

type BaseProps = {
  label: string;
  className?: string;
};

type LinkBackProps = BaseProps & {
  to: string;
  onClick?: never;
};

type ButtonBackProps = BaseProps & {
  onClick: () => void;
  to?: never;
};

export type BackButtonProps = LinkBackProps | ButtonBackProps;

export const BackButton = ({ label, className, ...props }: BackButtonProps) => {
  const classes = cn(backButtonClassName, className);
  const content = (
    <>
      <ChevronLeft size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-medium uppercase tracking-widest">{label}</span>
    </>
  );

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={classes}>
      {content}
    </button>
  );
};
