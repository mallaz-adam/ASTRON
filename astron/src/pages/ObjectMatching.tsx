import { useEffect, useId, useRef, useState } from 'react';
import type { ObjectId, ObjectKind, VisualUnitData } from '../data/visualUnit';
import { matchingFeedback } from '../logic/visualUnit';
import { practiceAttempted } from '../logic/unitPractice';
import { Button } from '../design/Button';
import { GlauxArt } from '../design/InlineArt';

const roles: { kind: ObjectKind; title: string; clue: string }[] = [
  { kind: 'planet', title: 'Planet', clue: 'A world travelling around a star' },
  { kind: 'star', title: 'Star', clue: 'Makes its own light' },
  { kind: 'natural satellite', title: 'Natural satellite', clue: 'Travels around a planet, like our Moon' },
];

export function UnitMatching({ data, onAttempt }: { data: VisualUnitData; onAttempt?: () => void }) {
  const id = useId();
  const [answers, setAnswers] = useState<Partial<Record<ObjectId, ObjectKind>>>({});
  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState(0);
  const lastObject = useRef(active);
  const objectHeading = useRef<HTMLLegendElement>(null);
  const response = useRef<HTMLDivElement>(null);
  const object = data.objects[active];
  useEffect(() => {
    if (lastObject.current === active) return;
    lastObject.current = active;
    const heading = objectHeading.current;
    heading?.focus({ preventScroll: true });
    const bounds = heading?.getBoundingClientRect();
    if (bounds && (bounds.top < 24 || bounds.bottom > window.innerHeight - 160)) heading?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [active]);
  useEffect(() => {
    if (!checked) return;
    response.current?.focus({ preventScroll: true });
    response.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [checked]);
  const feedback = matchingFeedback(data, answers);
  const complete = feedback.every(item => item.correct);
  const ready = practiceAttempted(data.objects.map(object => answers[object.id]), true);
  return <div className="unit-practice-content">
    <p>{data.matching.prompt}</p><p className="unit-caption">Choose a role, then use Next to move between pictures.</p>
    <div className="object-switches" role="group" aria-label="Choose an object to match">{data.objects.map((item, index) => <button type="button" key={item.id} aria-pressed={active === index} onClick={() => setActive(index)}>{item.name}<span>{answers[item.id] ? 'Chosen' : 'Not chosen'}</span></button>)}</div>
    <fieldset key={object.id} className="object-match">
      <legend ref={objectHeading} tabIndex={-1}>{object.name}</legend>
      <img src={object.src} alt={object.alt} width="120" height="120" decoding="async" />
      <div className="object-role-choices">{roles.map(role => <label key={role.kind}>
        <input type="radio" name={`${id}-${object.id}`} value={role.kind} checked={answers[object.id] === role.kind}
          aria-label={`${object.name}: ${role.title}. ${role.clue}`}
          onChange={() => { setAnswers(previous => ({ ...previous, [object.id]: role.kind })); setChecked(false); }} />
        <span><span className="object-role-title">{role.title}</span><span className="object-role-clue">{role.clue}</span></span>
      </label>)}</div>
    </fieldset>
    <div className="object-match-navigation"><span>{Object.keys(answers).length} of {data.objects.length} objects chosen</span>{active < data.objects.length - 1 && <Button variant="secondary" onClick={() => setActive(active + 1)}>Next: {data.objects[active + 1].name}</Button>}</div>
    <details className="unit-hint"><summary>Hint from Glaux</summary><p>{data.matching.hint}</p></details>
    <Button variant="secondary" disabled={!ready} onClick={() => { setChecked(true); onAttempt?.(); }}>Check the matches</Button>
    <div ref={response} tabIndex={-1} className={checked ? 'unit-feedback object-matching-feedback' : undefined} role="status" aria-live="polite" aria-atomic="true" aria-label="Matching feedback">{checked && <><GlauxArt mood={complete ? 'proud' : 'gentle'} />{complete ? <p>{data.matching.right}</p> : <><p>You can try again or continue. Follow the clues for each object.</p>{feedback.map(item => <p key={item.id}><span aria-hidden="true">{item.correct ? '✓ ' : '↳ '}</span>{data.objects.find(object => object.id === item.id)!.name}: {item.text}</p>)}</>}
      <Button variant="secondary" onClick={() => { setChecked(false); objectHeading.current?.focus({ preventScroll: true }); objectHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); }}>Review my choices</Button>
    </>}</div>
  </div>;
}
