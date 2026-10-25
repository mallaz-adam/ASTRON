import { useEffect, useReducer, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useProgress } from '../hooks/useProgress';
import { localLearnerId } from '../data/learner';
import { GlauxArt } from './InlineArt';
import { useReducedMotion } from './useReducedMotion';
import { introDurationMs, introPhase } from './introState';
import './StartupIntro.css';

function IntroPicture() {
  return <span className="startup-brand" aria-hidden="true">
    <GlauxArt mood="happy" className="startup-glaux" />
    <span className="startup-wordmark">ASTRON</span>
  </span>;
}

export function StartupIntro({ children }: { children: ReactNode }) {
  const { progress, error } = useProgress();
  const savedMotion = progress?.learners.find(row => row.id === localLearnerId)?.reduceMotion ?? false;
  const reduceMotion = useReducedMotion(savedMotion);
  const [phase, send] = useReducer(introPhase, 'waiting');
  const button = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const visible = phase !== 'finished' && !reduceMotion;

  useEffect(() => {
    // Wait for the saved preference before moving any part of Glaux.
    if (error) send({ type: 'finish' });
    else if (progress) send({ type: 'ready', reduceMotion });
  }, [progress, error, reduceMotion]);

  useEffect(() => {
    if (phase !== 'waving' || reduceMotion) return;
    const timer = window.setTimeout(() => send({ type: 'finish' }), introDurationMs);
    return () => window.clearTimeout(timer);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (!visible) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    button.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = overflow; };
  }, [visible]);

  useEffect(() => {
    if (phase !== 'finished') return;
    const heading = content.current?.querySelector<HTMLElement>('main h1') ?? content.current?.querySelector<HTMLElement>('main');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }, [phase]);

  return <>
    <div className="startup-content" ref={content} inert={visible} aria-hidden={visible || undefined}>{children}</div>
    {visible && <div className="startup-intro" data-phase={phase} style={{ '--intro-duration': `${introDurationMs}ms` } as CSSProperties}>
      <button ref={button} type="button" className="startup-open" aria-label="Open ASTRON" onClick={() => send({ type: 'finish' })} onKeyDown={event => { if (event.key === 'Escape') send({ type: 'finish' }); }}>
        <IntroPicture />
      </button>
    </div>}
  </>;
}
