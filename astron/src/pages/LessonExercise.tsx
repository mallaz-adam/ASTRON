import { useRef } from 'react';
import { Button } from '../design/Button';
import type { Exercise } from '../data/types';
import { canCheck, exerciseDone, exerciseItems, type ExerciseRun } from '../logic/lessonPlayer';

type Props = {
  exercise: Exercise; answer: ExerciseRun; busy: boolean;
  select: (id: string) => void; undo: () => void; check: () => void; reveal: () => void;
};

export function LessonExercise({ exercise, answer, busy, select, undo, check, reveal }: Props) {
  const controls = useRef<HTMLDivElement>(null);
  const items = exerciseItems(exercise);
  const solved = exerciseDone(answer);
  function place(id: string) {
    select(id);
    // An order item moves out of the available list; keep keyboard focus useful.
    requestAnimationFrame(() => controls.current?.querySelector<HTMLButtonElement>('.order-available button:not(:disabled), .exercise-check:not(:disabled)')?.focus({ preventScroll: true }));
  }
  return <div className="lesson-exercise" ref={controls}>
    {exercise.type === 'order' ? <>
      <p className="exercise-prompt">{exercise.prompt}</p>
      <ol className="order-slots" aria-label={exercise.prompt}>
        {items.map((_, index) => {
          const item = items.find(row => row.id === answer.selection[index]);
          return <li key={index}><span className="order-place">{index + 1}</span>{item && <span className="order-placed"><span className="colour-disc" style={{ background: item.colour }} aria-hidden="true" />{item.text}</span>}</li>;
        })}
      </ol>
      <div className="order-available">
        {items.filter(item => !answer.selection.includes(item.id)).map(item => <button key={item.id} type="button" className="order-item" disabled={busy || solved} onClick={() => place(item.id)}>
          <span className="colour-disc" style={{ background: item.colour }} aria-hidden="true" />{item.text}
        </button>)}
      </div>
    </> : <fieldset className="choice-options" disabled={busy || solved}>
      <legend>{exercise.prompt}</legend>
      {items.map(item => <label key={item.id} className={`choice-option${answer.selection[0] === item.id ? ' choice-option--selected' : ''}`}>
        <input type="radio" name={exercise.id} value={item.id} checked={answer.selection[0] === item.id} onChange={() => select(item.id)}
          onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); select(item.id); } }} />
        <span className="choice-letter">{item.id}</span><span>{item.text}</span>
      </label>)}
    </fieldset>}
    <div className="exercise-actions">
      {exercise.type === 'order' && <Button variant="secondary" disabled={busy || solved || answer.selection.length === 0} onClick={undo}>UNDO</Button>}
      <Button className="exercise-check" disabled={busy || !canCheck(exercise, answer)} onClick={check}>CHECK</Button>
      {answer.attempts >= 2 && !solved && <Button variant="secondary" disabled={busy} onClick={reveal}>SHOW ME</Button>}
    </div>
  </div>;
}
