import type { ReactNode } from 'react';

type PageProps = {
  children: ReactNode;
  reduceMotion?: boolean;
  className?: string;
  skipLabel?: string;
};

export function Page({ children, reduceMotion = false, className = '', skipLabel = 'Skip to design check' }: PageProps) {
  return (
    <div className={`atlas-page ${className}`} data-reduce-motion={reduceMotion}>
      <div className="paper-grain" aria-hidden="true" />
      <a className="skip-link" href="#main-content">{skipLabel}</a>
      <div className="page-content">{children}</div>
    </div>
  );
}
