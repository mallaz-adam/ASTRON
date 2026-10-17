import { useLayoutEffect, useRef } from 'react';
import type { Exercise } from '../data/types';
import { exerciseDone, exerciseItems, type ExerciseRun } from '../logic/lessonPlayer';
import { answerRacePlan } from '../logic/lessonDiagrams';
import { FuelPicture } from './StarDiagrams';
import { RaceControls } from './InteractiveCards';
import { useControlledRace } from './useControlledRace';

export function PictureChoice({ exercise, answer, busy, select, reduceMotion, active }: {
  exercise: Exercise; answer: ExerciseRun; busy: boolean; select: (id: string) => void; reduceMotion: boolean; active: boolean;
}) {
  const race = useControlledRace(reduceMotion, active);
  const { seek, play } = race;
  const handled = useRef('');
  const solved = exerciseDone(answer);
  useLayoutEffect(() => {
    const outcome = `${answer.attempts}-${answer.status}`;
    if (reduceMotion && solved) { handled.current = outcome; seek(1); return; }
    if (!active) return;
    if (handled.current === outcome) return;
    handled.current = outcome;
    const plan = answerRacePlan(answer.status, reduceMotion);
    seek(plan.time);
    if (plan.play) play();
  }, [answer.attempts, answer.status, reduceMotion, active, solved, seek, play]);

  return <div className="picture-choice">
    <fieldset className="choice-options" disabled={busy || solved}>
      <legend>{exercise.prompt}</legend>
      <div className="picture-options">
        {exerciseItems(exercise).map(item => <label key={item.id}
          className={`choice-option picture-option${item.id === 'C' ? ' picture-option--same' : ''}${answer.selection[0] === item.id ? ' choice-option--selected' : ''}`}>
          {item.id !== 'C' && <span className="picture-option-art"><FuelPicture star={item.id === 'A' ? 'heavier' : 'lighter'} time={race.time} /></span>}
          <input type="radio" name={exercise.id} value={item.id} checked={answer.selection[0] === item.id} onChange={() => select(item.id)}
            onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); select(item.id); } }} />
          <span><span className="choice-letter">{item.id}</span> {item.text}</span>
        </label>)}
      </div>
    </fieldset>
    {answer.attempts > 0 && <RaceControls race={race} reduceMotion={reduceMotion} />}
  </div>;
}
