import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import type { Exercise } from '../data/types';
import { correctSelection, exerciseDone, exerciseItems, type ExerciseRun } from '../logic/lessonPlayer';

export function HeatLadder({ exercise, answer, source }: {
  exercise: Exercise; answer: ExerciseRun; source: RefObject<HTMLOListElement | null>;
}) {
  const targets = useRef<Record<string, HTMLSpanElement | null>>({});
  const [offsets, setOffsets] = useState<Record<string, CSSProperties>>({});
  const solved = exerciseDone(answer);
  const items = exerciseItems(exercise);
  const rungs = [...correctSelection(exercise)].reverse().map(id => items.find(item => item.id === id)!);

  // Start each destination disc at its source slot, then let CSS settle it on its rung.
  useLayoutEffect(() => {
    if (answer.status !== 'correct') return;
    const positions: Record<string, CSSProperties> = {};
    for (const item of items) {
      const origin = [...(source.current?.querySelectorAll<HTMLElement>('[data-star]') ?? [])].find(node => node.dataset.star === item.id);
      const target = targets.current[item.id];
      if (!origin || !target) continue;
      const from = origin.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      positions[item.id] = { '--from-x': `${from.x - to.x}px`, '--from-y': `${from.y - to.y}px` } as CSSProperties;
    }
    setOffsets(positions);
  }, [answer.status, source]);

  return <div className={`heat-ladder${solved ? '' : ' heat-ladder--faint'}`} data-state={answer.status}>
    <span className="heat-label">hotter</span>
    <ol className="heat-rungs" aria-label={exercise.prompt}>
      {rungs.map((item, index) => <li key={item.id}>
        {solved ? <span className="heat-arrival" key={`${item.id}-${answer.status}`}>
          <span ref={node => { targets.current[item.id] = node; }} className="colour-disc heat-star" style={{ background: item.colour, ...offsets[item.id] }} aria-hidden="true" />
          <span>{item.text}</span>
        </span> : <span className="heat-clue" key={`${item.id}-${answer.attempts}`} aria-hidden="true"
          style={{ '--clue-delay': `${(2 - index) * 200}ms` } as CSSProperties}>
          <span className="colour-disc" style={{ background: item.colour }} />{item.text}
        </span>}
      </li>)}
    </ol>
    <span className="heat-label">cooler</span>
  </div>;
}
