import { useState } from 'react';
import { planetIds, type SolarSystemUnitData } from '../data/solarSystemUnit';
import { innerOrderFeedback, solarSortingFeedback } from '../logic/solarSystem';
import { Button } from '../design/Button';
import { GlauxArt } from '../design/InlineArt';
import { PlanetOrder } from './SolarSystemPictures';

export function SolarOrderPractice({ data }: { data: SolarSystemUnitData }) {
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [kept, setKept] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const feedback = innerOrderFeedback(data, answers);
  const complete = feedback.every(f => f.correct);
  function check() { setChecked(true); setKept(feedback.flatMap((item, index) => item.correct ? [index] : [])); }
  return <div className="unit-practice-content"><p>{data.orderPractice.prompt}</p><p className="unit-caption">{data.orderPractice.reference}</p>
    <PlanetOrder data={data} innerOnly interactive={false} />
    <fieldset className="solar-practice-order"><legend>Follow the inner planets outward</legend>{data.orderPractice.positions.map((position, index) => <label key={position}><span>{position}{kept.includes(index) && ' — kept'}</span><select aria-label={position} value={answers[index]} disabled={kept.includes(index)} onChange={e => { setAnswers(answers.map((a, i) => i === index ? e.target.value : a)); setChecked(false); }}>
      <option value="">Choose a planet</option>{planetIds.slice(0, 4).map(id => <option value={id} key={id}>{data.objects.find(i => i.id === id)!.name}</option>)}
    </select></label>)}</fieldset>
    <details className="unit-hint"><summary>Hint from Glaux</summary><p>{data.orderPractice.hint}</p></details>
    <Button variant="secondary" onClick={check}>Check the order</Button>
    {checked && <div className="unit-feedback" role="status"><GlauxArt mood={complete ? 'proud' : 'gentle'} />{complete ? <p>{data.orderPractice.right}</p> : feedback.map(item => <p key={item.id}><span aria-hidden="true">{item.correct ? '✓ ' : '↳ '}</span>{item.text}</p>)}</div>}
  </div>;
}

export function SolarSortingPractice({ data }: { data: SolarSystemUnitData }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [kept, setKept] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const feedback = solarSortingFeedback(data, answers);
  const complete = feedback.every(item => item.correct);
  return <div className="unit-practice-content"><p>{data.sorting.prompt}</p><fieldset className="solar-sorting"><legend>Who belongs where?</legend>{data.sorting.cards.map(card => <label key={card.id}>
    <img src={data.objects.find(i => i.id === card.imageId)!.src} alt="" width="48" height="48" /><span>{card.title}{kept.includes(card.id) && ' — kept'}</span>
    <select aria-label={`Group for ${card.title}`} value={answers[card.id] ?? ''} disabled={kept.includes(card.id)} onChange={e => { setAnswers({ ...answers, [card.id]: e.target.value }); setChecked(false); }}><option value="">Choose a group</option>{data.sorting.groups.map(group => <option key={group.id} value={group.id}>{group.label}</option>)}</select>
  </label>)}</fieldset><details className="unit-hint"><summary>Hint from Glaux</summary><p>{data.sorting.hint}</p></details>
    <Button variant="secondary" onClick={() => { setChecked(true); setKept(feedback.filter(f => f.correct).map(f => f.id)); }}>Check the groups</Button>
    {checked && <div className="unit-feedback" role="status"><GlauxArt mood={complete ? 'proud' : 'gentle'} />{complete ? <p>{data.sorting.right}</p> : feedback.map(item => <p key={item.id}><span aria-hidden="true">{item.correct ? '✓ ' : '↳ '}</span>{item.text}</p>)}</div>}
  </div>;
}

export function SolarPractice({ data, kind }: { data: SolarSystemUnitData; kind: 'order' | 'sorting' }) {
  const [open, setOpen] = useState(false);
  return <section className="unit-practice"><button type="button" className="unit-small-button" aria-expanded={open} aria-controls={`solar-practice-${kind}`} onClick={() => setOpen(!open)}>{kind === 'order' ? 'Try the inner planet order (optional)' : 'Try sorting the family (optional)'}</button>
    {open && <div id={`solar-practice-${kind}`}><p className="unit-caption">No score or timer. You can continue whenever you like. Correct placements are kept.</p>{kind === 'order' ? <SolarOrderPractice data={data} /> : <SolarSortingPractice data={data} />}</div>}
  </section>;
}
