import type { ReactNode } from 'react';

type PageProps = {
  children: ReactNode;
  reduceMotion?: boolean;
};

export function Page({ children, reduceMotion = false }: PageProps) {
  return (
    <div className="atlas-page" data-reduce-motion={reduceMotion}>
      <div className="paper-grain" aria-hidden="true" />
      <a className="skip-link" href="#main-content">Skip to design check</a>
      <div className="page-content">{children}</div>
    </div>
  );
}
