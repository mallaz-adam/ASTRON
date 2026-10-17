import { useId } from 'react';

export function LessonSlider({ label, value, state, change, left, right, className = '' }: {
  label: string; value: number; state: string; change: (position: number) => void;
  left?: string; right?: string; className?: string;
}) {
  const id = useId();
  return <div className={`lesson-slider ${className}`}>
    <label className="slider-label" htmlFor={id}>{label}</label>
    <input id={id} type="range" min="0" max="1000" step="1" value={Math.round(value * 1000)}
      aria-valuetext={state} onChange={event => change(Number(event.currentTarget.value) / 1000)} />
    {(left || right) && <div className="slider-ends" aria-hidden="true"><span>{left}</span><span>{right}</span></div>}
    <output htmlFor={id} role="status" aria-live="polite" aria-atomic="true">{state}</output>
  </div>;
}
