import { useState } from 'react';
import type { MilkyWayUnitData } from '../data/milkyWayUnit';
import { milkyChoiceFeedback, milkyMatchingFeedback } from '../logic/milkyWay';
import { GlauxArt } from '../design/InlineArt';
import { Button } from '../design/Button';

export function MilkyChoicePractice({ data }: { data: MilkyWayUnitData }) {
  const [answer, setAnswer] = useState('');
  const feedback = milkyChoiceFeedback(data, answer);
  return <div className="unit-practice-content"><fieldset className="unit-choices"><legend>{data.choice.prompt}</legend>
    {data.choice.options.map(option => <label key={option.id}><input type="radio" name="milky-connected-explanation" value={option.id} checked={answer === option.id} onChange={() => setAnswer(option.id)} /><span>{option.id}. {option.text}</span></label>)}
  </fieldset><details className="unit-hint"><summary>Hint from Glaux</summary><p>{data.choice.hint}</p></details>
    {feedback && <div className="unit-feedback milky-choice-feedback" role="status"><GlauxArt mood={feedback.correct ? 'proud' : 'gentle'} /><p>{feedback.text}</p>{feedback.correct && <p>{data.choice.explanation}</p>}</div>}
  </div>;
}

export function MilkyMatchingPractice({ data }: { data: MilkyWayUnitData }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [kept, setKept] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const feedback = milkyMatchingFeedback(data, answers);
  const complete = feedback.every(item => item.correct);
  return <div className="unit-practice-content"><p>{data.matching.prompt}</p><fieldset className="milky-matches"><legend>Match the view</legend>
    {data.matching.cards.map((card, index) => <div className="milky-match-card" key={card.id}>
      <label><span>{card.text}{kept.includes(card.id) && ' — kept'}</span><select aria-label={`View for: ${card.text}`} aria-describedby={checked && !feedback[index].correct ? `milky-feedback-${card.id}` : undefined} disabled={kept.includes(card.id)} value={answers[card.id] ?? ''} onChange={event => { setAnswers({ ...answers, [card.id]: event.target.value }); setChecked(false); }}>
        <option value="">Choose a view</option>{data.matching.groups.map(group => <option value={group.id} key={group.id}>{group.label}</option>)}
      </select></label>
      {checked && !feedback[index].correct && <p id={`milky-feedback-${card.id}`} className="milky-match-feedback">{feedback[index].text}</p>}
    </div>)}
  </fieldset><details className="unit-hint"><summary>Hint from Glaux</summary><p>{data.matching.hint}</p></details>
    <Button variant="secondary" onClick={() => { setChecked(true); setKept(feedback.filter(f => f.correct).map(f => f.id)); }}>Check the views</Button>
    {checked && <div className="unit-feedback" role="status"><GlauxArt mood={complete ? 'proud' : 'gentle'} /><p>{complete ? data.matching.right : 'Correct matches are kept. You can try the remaining descriptions again.'}</p></div>}
  </div>;
}

export function MilkyPractice({ data, kind }: { data: MilkyWayUnitData; kind: 'choice' | 'matching' }) {
  const [open, setOpen] = useState(false);
  return <section className="unit-practice"><button type="button" className="unit-small-button" aria-expanded={open} aria-controls={`milky-practice-${kind}`} onClick={() => setOpen(!open)}>{kind === 'choice' ? 'Try the connected explanation (optional)' : 'Try matching the views (optional)'}</button>
    {open && <div id={`milky-practice-${kind}`}><p className="unit-caption">Optional, ungraded practice. No score or timer. You can continue whenever you like.</p>{kind === 'choice' ? <MilkyChoicePractice data={data} /> : <MilkyMatchingPractice data={data} />}</div>}
  </section>;
}
