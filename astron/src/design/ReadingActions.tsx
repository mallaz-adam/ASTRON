import { useEffect, useRef, type ReactNode } from 'react';
import './ReadingActions.css';

// The same controls stay in reading order on desktop and within reach on phones.
// Reserve their measured height so zoom and the home indicator cannot hide text.
export function ReadingActions({ children, label }: { children: ReactNode; label: string }) {
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = bar.current;
    const page = element?.closest<HTMLElement>('.atlas-page');
    if (!element || !page) return;
    const measure = () => page.style.setProperty('--reading-action-height', `${Math.ceil(element.getBoundingClientRect().height)}px`);
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => { window.removeEventListener('resize', measure); page.style.removeProperty('--reading-action-height'); };
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => { observer.disconnect(); page.style.removeProperty('--reading-action-height'); };
  }, []);
  return <nav ref={bar} className="reading-actions" aria-label={label}>{children}</nav>;
}
