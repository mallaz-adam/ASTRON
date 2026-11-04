import { useEffect, useRef, useState } from 'react';
import type { OrionTaleData } from '../../data/taleExperience';
import type { TaleVisit } from '../../data/types';
import type { BeltChoice } from '../../logic/taleJourney';
import { Button } from '../../design/Button';
import { orionPattern } from '../../logic/orionChart';
import { OrionChart } from './OrionChart';
import { TaleGlaux } from './TaleCommon';

export function BeltActivity({ data, outcome, busy, onAnswer, onContinue }: {
  data: OrionTaleData; outcome?: TaleVisit['beltOutcome']; busy: boolean;
  onAnswer: (choice: BeltChoice | 'show-me') => Promise<boolean | undefined>; onContinue: () => void;
}) {
  const [choice, setChoice] = useState<BeltChoice>();
  const [response, setResponse] = useState('');
  const [hint, setHint] = useState(false);
  const feedback = useRef<HTMLDivElement>(null);
  const choices = useRef<HTMLDivElement>(null);
  const line = outcome ? outcome === 'assisted' ? data.activity.showLine : data.activity.rightLine : response || (hint ? data.activity.hint : '');
  useEffect(() => {
    if (!line) return;
    feedback.current?.focus({ preventScroll: true });
    feedback.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [line]);
  async function check() {
    if (!choice) return;
    const correct = await onAnswer(choice);
    if (correct === false) setResponse(data.activity.groups.find(group => group.id === choice)!.missedLine);
  }
  return <section className="belt-activity" aria-labelledby="belt-title">
    <div className="belt-intro"><p className="tale-eyebrow">Your turn</p><h1 id="belt-title">{data.activity.prompt}</h1><p>Choose the star picture that matches the belt, then check.</p><p className="tale-picture-note">You can try again or choose Show me. Take your time.</p></div>
    <div className="belt-controls">
    <div ref={choices} tabIndex={-1} className="belt-picture-choices" role="group" aria-label="Choose a star picture">
      {data.activity.groups.map(group => {
        const selected = (outcome ? 'belt' : choice) === group.id;
        return <button type="button" key={group.id} className="belt-picture-choice" disabled={busy || Boolean(outcome)} aria-pressed={selected} aria-label={`${group.label}. ${group.description}`} onClick={() => { setChoice(group.id); setResponse(''); }}>
          <svg viewBox="0 0 100 80" aria-hidden="true">{orionPattern(data.chart.stars, group.starIds, data.activity.groups.map(group => group.starIds)).map(point => <g key={point.id}><circle cx={point.x} cy={point.y} r="5" fill="currentColor" opacity=".12" /><circle cx={point.x} cy={point.y} r="1.8" fill="currentColor" /></g>)}</svg>
          <span>{group.label}{selected && <span aria-hidden="true"> ✓</span>}</span>
        </button>;
      })}
    </div>
    <p className="belt-selection" role="status">{outcome ? 'The belt is highlighted.' : choice ? `${data.activity.groups.find(group => group.id === choice)!.label} selected.` : 'Choose one picture.'}</p>
    <div className="belt-help"><Button variant="secondary" disabled={busy || Boolean(outcome)} onClick={() => setHint(true)}>Hint</Button><Button variant="secondary" disabled={busy || Boolean(outcome)} onClick={() => void onAnswer('show-me')}>Show me</Button></div>
    {!outcome && <Button onClick={() => void check()} disabled={busy || !choice}>Check</Button>}
    <div ref={feedback} tabIndex={-1} className="belt-response" role="status" aria-label="Pattern feedback" aria-live="polite" aria-atomic="true">{line && <TaleGlaux mood={outcome === 'independent' ? 'proud' : 'gentle'}>{line}</TaleGlaux>}{outcome && <p>{data.activity.explanation}</p>}</div>
    {response && !outcome && <Button variant="secondary" onClick={() => { choices.current?.focus({ preventScroll: true }); choices.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); }}>Try another picture</Button>}
    {outcome && <Button onClick={onContinue} disabled={busy}>Continue</Button>}
    <details className="belt-whole-chart" open={outcome ? true : undefined}><summary>See the whole star chart</summary><figure className="tale-plate"><OrionChart data={data} activity={!outcome} highlight={outcome ? 'belt' : choice} labels={Boolean(outcome)} connections={Boolean(outcome)} /><figcaption>Orion, seen from Earth</figcaption></figure></details>
    </div>
  </section>;
}
