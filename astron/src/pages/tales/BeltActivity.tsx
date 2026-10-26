import { useState } from 'react';
import type { TaleExperienceData } from '../../data/taleExperience';
import type { TaleVisit } from '../../data/types';
import type { BeltChoice } from '../../logic/taleJourney';
import { Button } from '../../design/Button';
import { DiscoveryDetails } from '../../design/DiscoveryDetails';
import { OrionChart } from './OrionChart';
import { TaleGlaux } from './TaleCommon';

export function BeltActivity({ data, outcome, busy, onAnswer, onContinue }: {
  data: TaleExperienceData; outcome?: TaleVisit['beltOutcome']; busy: boolean;
  onAnswer: (choice: BeltChoice | 'show-me') => Promise<boolean | undefined>; onContinue: () => void;
}) {
  const [choice, setChoice] = useState<BeltChoice>();
  const [response, setResponse] = useState('');
  const [hint, setHint] = useState(false);
  const line = outcome ? outcome === 'assisted' ? data.activity.showLine : data.activity.rightLine : response || (hint ? data.activity.hint : '');
  async function check() {
    if (!choice) return;
    const correct = await onAnswer(choice);
    if (correct === false) setResponse(data.activity.groups.find(group => group.id === choice)!.missedLine);
  }
  return <section className="belt-activity" aria-labelledby="belt-title">
    <div className="belt-intro"><p className="tale-eyebrow">Your turn</p><h1 id="belt-title">{data.activity.prompt}</h1><p>Choose a group, then check.</p></div>
    <figure className="tale-plate belt-plate"><OrionChart data={data} activity={!outcome} highlight={outcome ? 'belt' : choice} labels={Boolean(outcome)} connections={Boolean(outcome)} /><figcaption>Orion, seen from Earth</figcaption></figure>
    <div className="belt-controls"><fieldset className="belt-choices" disabled={busy || Boolean(outcome)}><legend>Choose a group</legend>
      {data.activity.groups.map(group => <label key={group.id} className="belt-choice"><input type="radio" name="belt-group" value={group.id} checked={(outcome ? 'belt' : choice) === group.id} aria-label={`${group.label}. ${group.description}`} onChange={() => { setChoice(group.id); setResponse(''); }} /><span>{group.label}</span></label>)}
    </fieldset>
    <DiscoveryDetails className="tale-discovery belt-descriptions" detailId={`tale:${data.taleId}:patterns`} label="Describe the patterns">{data.activity.groups.map(group => <p key={group.id}>{group.label}: {group.description}</p>)}</DiscoveryDetails>
    <div className="belt-help"><Button variant="secondary" disabled={busy || Boolean(outcome)} onClick={() => setHint(true)}>Hint</Button><Button variant="secondary" disabled={busy || Boolean(outcome)} onClick={() => void onAnswer('show-me')}>Show me</Button></div>
    <div className="belt-response" role="status" aria-live="polite" aria-atomic="true">{line && <TaleGlaux mood={outcome === 'independent' ? 'proud' : 'gentle'}>{line}</TaleGlaux>}{outcome && <p>{data.activity.explanation}</p>}</div>
    {outcome ? <Button onClick={onContinue} disabled={busy}>Continue</Button> : <Button onClick={() => void check()} disabled={busy || !choice}>Check</Button>}
    </div>
  </section>;
}
