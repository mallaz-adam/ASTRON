import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { HunchChoice } from '../data/types';
import { RecapStar } from '../design/LessonArt';
import { hunchTint, starColours } from '../logic/stars';
import './LessonRecap.css';

const starPath = 'M0 -10 2.5 -2.5 10 0 2.5 2.5 0 10 -2.5 2.5 -10 0 -2.5 -2.5Z';
type Point = { x: number; y: number };

export function LessonRecap({ items, finished, hunch, reduceMotion }: {
  items: string[]; finished: boolean; hunch?: HunchChoice; reduceMotion: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ width: number; height: number; points: Point[] }>();
  const [settled, setSettled] = useState(reduceMotion);
  const tint = hunchTint(hunch);

  useLayoutEffect(() => {
    if (reduceMotion) setSettled(true);
  }, [reduceMotion]);
  useLayoutEffect(() => {
    if (!finished || !box.current) return;
    const element = box.current;
    function measure() {
      const bounds = element.getBoundingClientRect();
      const points = [...element.querySelectorAll('.clue-anchor')].map(anchor => {
        const rect = anchor.getBoundingClientRect();
        return { x: rect.left - bounds.left, y: rect.top - bounds.top };
      });
      setLayout({ width: bounds.width, height: bounds.height, points });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [finished]);

  const animate = finished && !reduceMotion && !settled;
  const target = layout ? { x: layout.width / 2, y: layout.height - 42 } : undefined;
  return <div className={`lesson-clues${finished ? ' lesson-clues--finished' : ''}${animate ? ' lesson-clues--drawing' : ''}`}>
    <div className="clue-picture" ref={box}>
      <ul className="lesson-recap">
        {items.map((item, index) => <li key={item}>
          {finished ? <span className={`clue-anchor clue-anchor--${index}`} aria-hidden="true" /> : <RecapStar />}
          <span>{item}</span>
        </li>)}
      </ul>
      {finished && layout && target && <svg className="clue-constellation" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
        <g className="clue-lines" fill="none" stroke="var(--gold)" strokeWidth="1">
          {layout.points.map((point, index) => {
            const next = layout.points[(index + 1) % layout.points.length];
            return <path key={index} className="clue-line" pathLength="1" d={`M${point.x} ${point.y} L${next.x} ${next.y}`}
              style={{ '--line-delay': `${index * .5}s` } as CSSProperties} />;
          })}
        </g>
        {layout.points.map((point, index) => <g key={index} transform={`translate(${point.x} ${point.y})`}>
          <g className="clue-traveller" style={{ '--merge-x': `${target.x - point.x}px`, '--merge-y': `${target.y - point.y}px` } as CSSProperties}>
            <path d={starPath} fill="var(--gold)" stroke="var(--ink)" strokeWidth=".6" />
          </g>
        </g>)}
        <g transform={`translate(${target.x} ${target.y})`}>
          <g className="clue-arrival" data-tint={tint} onAnimationEnd={() => setSettled(true)}>
            <circle r="33" fill={starColours[tint]} opacity=".15" />
            <circle r="25" fill={starColours[tint]} opacity=".25" />
            <path d={starPath} transform="scale(1.8)" fill={starColours[tint]} stroke="var(--ink)" strokeWidth=".6" />
          </g>
        </g>
      </svg>}
      {finished && (!layout || !target) && <svg className="clue-fallback" viewBox="0 0 80 80" aria-hidden="true" data-tint={tint}>
        <circle cx="40" cy="40" r="32" fill={starColours[tint]} opacity=".25" />
        <path d={starPath} transform="translate(40 40) scale(1.8)" fill={starColours[tint]} stroke="var(--ink)" strokeWidth=".6" />
      </svg>}
    </div>
    {finished && <p className="clue-caption" role="status">Added to your sky<span className="lesson-title"> · The first clue · {tint}</span></p>}
  </div>;
}
