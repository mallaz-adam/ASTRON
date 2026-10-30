import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Content, Lesson } from '../data/types';
import { loadVisualUnit, type ObjectId, type ObjectKind, type UnitStep, type VisualUnitData } from '../data/visualUnit';
import { isSolarSystemUnit, loadSolarSystemUnit, type SolarSystemUnitData } from '../data/solarSystemUnit';
import { isMilkyWayUnit, loadMilkyWayUnit, type MilkyWayUnitData } from '../data/milkyWayUnit';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { finishReadingLesson } from '../data/lessonServices';
import { matchingFeedback } from '../logic/visualUnit';
import { Page } from '../design/Page';
import { Button } from '../design/Button';
import { ReadingActions } from '../design/ReadingActions';
import { GlauxArt } from '../design/InlineArt';
import { useReducedMotion } from '../design/useReducedMotion';
import { ObjectGallery, UnitPicture } from './UnitPictures';
import { SolarFamily, SolarSystemPicture } from './SolarSystemPictures';
import { SolarPractice } from './SolarSystemPractice';
import { MilkyPhoto, MilkyViewComparison, MilkyWayPicture } from './MilkyWayPictures';
import { MilkyPractice } from './MilkyWayPractice';
import { useProgress } from '../hooks/useProgress';
import { nextReadingDestination } from '../logic/readingFlow';
import { milkyReadingPosition } from '../logic/milkyWay';
import './VisualUnit.css';

export function UnitWords({ step, data }: { step: Pick<UnitStep, 'paragraphs' | 'terms'>; data: Pick<VisualUnitData, 'glossary'> }) {
  const [term, setTerm] = useState('');
  const definition = data.glossary.find(item => item.term === term);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  function dismiss() { setTerm(''); trigger.current?.focus(); }
  useEffect(() => {
    if (!term) return;
    close.current?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); dismiss(); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [term]);
  // Link only the first useful mention of each selected term, at most two per step.
  const linked = new Set<string>();
  const pattern = step.terms.length ? new RegExp(`\\b(${[...step.terms].sort((a, b) => b.length - a.length).join('|')})\\b`, 'gi') : null;
  return <div className="unit-explanation">
    <div className="unit-prose">{step.paragraphs.map((paragraph, index) => <p key={index}>{pattern ? paragraph.split(pattern).map((part, i) => {
      const key = part.toLowerCase();
      if (!step.terms.includes(key) || linked.has(key)) return <Fragment key={i}>{part}</Fragment>;
      linked.add(key);
      return <button key={i} type="button" className="unit-term" aria-expanded={term === key} aria-controls="unit-definition" aria-label={`${part}: read the definition`}
        onClick={event => { trigger.current = event.currentTarget; setTerm(term === key ? '' : key); }}>{part}</button>;
    }) : paragraph}</p>)}</div>
    {definition && <section id="unit-definition" className="unit-definition" aria-label={`${definition.term} definition`}>
      <div><h2>{definition.term}</h2><button type="button" ref={close} onClick={dismiss}>Close definition</button></div>
      <p>{definition.definition}</p><p>{definition.example}</p>
    </section>}
  </div>;
}

export function UnitMatching({ data }: { data: VisualUnitData }) {
  const [answers, setAnswers] = useState<Partial<Record<ObjectId, ObjectKind>>>({});
  const [checked, setChecked] = useState(false);
  const feedback = matchingFeedback(data, answers);
  const complete = feedback.every(item => item.correct);
  return <div className="unit-practice-content"><p>{data.matching.prompt}</p>
    <fieldset className="unit-matches"><legend>Choose a label for each object</legend>{data.objects.map(object => <label key={object.id}>
      <img src={object.src} alt="" width="44" height="44" /><span>{object.name}</span>
      <select aria-label={`Label for ${object.name}`} value={answers[object.id] ?? ''} onChange={e => { setAnswers({ ...answers, [object.id]: e.target.value as ObjectKind }); setChecked(false); }}>
        <option value="">Choose a label</option><option value="planet">Planet</option><option value="star">Star</option><option value="natural satellite">Natural satellite</option>
      </select>
    </label>)}</fieldset>
    <details className="unit-hint"><summary>Hint from Glaux</summary><p>{data.matching.hint}</p></details>
    <Button variant="secondary" onClick={() => setChecked(true)}>Check the matches</Button>
    {checked && <div className="unit-feedback" role="status"><GlauxArt mood={complete ? 'proud' : 'gentle'} />{complete ? <p>{data.matching.right}</p> : feedback.map(item => <p key={item.id}><span aria-hidden="true">{item.correct ? '✓ ' : '↳ '}</span>{item.text}</p>)}</div>}
  </div>;
}

export function UnitChoice({ data }: { data: VisualUnitData }) {
  const [choice, setChoice] = useState('');
  const [checked, setChecked] = useState(false);
  const option = data.choice.options.find(item => item.id === choice);
  return <div className="unit-practice-content"><fieldset className="unit-choices"><legend>{data.choice.prompt}</legend>{data.choice.options.map(item => <label key={item.id}>
    <input type="radio" name="unit-moonlight" value={item.id} checked={item.id === choice} onChange={() => { setChoice(item.id); setChecked(false); }} /><span>{item.id}. {item.text}</span>
  </label>)}</fieldset>
    <details className="unit-hint"><summary>Hint from Glaux</summary><p>{data.choice.hint}</p></details>
    <Button variant="secondary" disabled={!choice} onClick={() => setChecked(true)}>Explore the answer</Button>
    {checked && option && <div className="unit-feedback" role="status"><GlauxArt mood={choice === data.choice.correct ? 'proud' : 'gentle'} /><p>{option.feedback}</p>{choice === data.choice.correct && <p>{data.choice.explanation}</p>}</div>}
  </div>;
}

function OptionalPractice({ data, kind }: { data: VisualUnitData; kind: 'matching' | 'choice' }) {
  const [open, setOpen] = useState(false);
  return <section className="unit-practice"><button type="button" className="unit-small-button" aria-expanded={open} aria-controls={`practice-${kind}`} onClick={() => setOpen(!open)}>
    {kind === 'matching' ? 'Try matching (optional)' : 'Try the moonlight mystery (optional)'}
  </button>{open && <div id={`practice-${kind}`}><p className="unit-caption">Take your time. This practice has no score; you can continue whenever you like.</p>{kind === 'matching' ? <UnitMatching data={data} /> : <UnitChoice data={data} />}</div>}</section>;
}

type IllustratedUnit = VisualUnitData | SolarSystemUnitData | MilkyWayUnitData;

function Credits({ data }: { data: IllustratedUnit }) {
  return <details className="unit-credits"><summary>Pictures and sources</summary>
    {data.objects.map(object => <p key={object.id}><a href={object.source} target="_blank" rel="noreferrer">{object.name}: {object.credit}</a><span>{object.caption} {'changes' in object ? object.changes : 'Resized and compressed for ASTRON.'}</span>{'license' in object && ('licenseUrl' in object ? <a href={object.licenseUrl} target="_blank" rel="noreferrer">{object.license}</a> : <span>{object.license}</span>)}</p>)}
    <ul>{data.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul>
  </details>;
}

function UnitOpeningPicture({ data }: { data: IllustratedUnit }) {
  if (isMilkyWayUnit(data)) return <MilkyPhoto data={data} id="sky" />;
  return isSolarSystemUnit(data) ? <SolarFamily data={data} interactive={false} /> : <ObjectGallery objects={data.objects} interactive={false} />;
}

function TeachingPicture({ data, index }: { data: IllustratedUnit; index: number }) {
  if (isMilkyWayUnit(data)) return <MilkyWayPicture scene={data.steps[index].scene} data={data} />;
  return isSolarSystemUnit(data) ? <SolarSystemPicture scene={data.steps[index].scene} data={data} /> : <UnitPicture scene={data.steps[index].scene} data={data} />;
}

function AfterUnitActions({ content, lesson, onAgain }: { content: Content; lesson: Lesson; onAgain: () => void }) {
  const { progress } = useProgress();
  const destination = nextReadingDestination(content, progress, localLearnerId, lesson.cellId);
  return <ReadingActions label="After the unit">
    {destination && destination.to !== '/learn' ? <Link className="atlas-button atlas-button--primary" to={destination.to}>Continue</Link>
      : <Link className="atlas-button atlas-button--primary" to="/learn">Back to the path</Link>}
    <button type="button" className="reading-previous" onClick={onAgain}>Read again</button>
  </ReadingActions>;
}

export function VisualUnitReader({ lesson, content, data, reduceMotion }: { lesson: Lesson; content: Content; data: IllustratedUnit; reduceMotion: boolean }) {
  const [index, setIndex] = useState(-1);
  const [finished, setFinished] = useState(false);
  const [busy, setBusy] = useState(false);
  const [earned, setEarned] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const step = data.steps[index];
  const reduced = useReducedMotion(reduceMotion);
  const milky = isMilkyWayUnit(data);
  const onRecap = milky && milkyReadingPosition(index, data.steps.length) === 'recap';
  const lastReadingIndex = data.steps.length - 1 + (milky ? 1 : 0);
  const unitNumber = isSolarSystemUnit(data) || milky ? data.unitNumber : 1;
  const cell = content.cells.find(row => row.id === lesson.cellId)!;
  const nextCell = content.cells.filter(row => row.unitId === cell.unitId && row.positionNo > cell.positionNo).sort((a, b) => a.positionNo - b.positionNo)[0];
  const nextReady = nextCell && content.lessons.some(row => row.cellId === nextCell.id && !row.placeholder);
  useEffect(() => { document.title = `${data.title} · ASTRON`; }, [data.title]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [index, finished]);
  async function advance() {
    if (saving.current) return;
    if (index < lastReadingIndex) { setIndex(index + 1); return; }
    saving.current = true; setBusy(true); setError('');
    try {
      const result = await finishReadingLesson(db, content, localLearnerId, lesson.id, new Date());
      setEarned(result.learnQuestEarned); setFinished(true);
    } catch (problem) { setError(problem instanceof Error ? problem.message : String(problem)); }
    finally { saving.current = false; setBusy(false); }
  }
  return <Page className={`unit-page${unitNumber === 2 ? ' solar-unit' : ''}${milky ? ' milky-unit' : ''}`} reduceMotion={reduced} skipLabel="Skip to lesson"><main id="main-content" className="unit-main" aria-busy={busy}>
    <header className="unit-header"><Link to="/learn">Back to the path</Link><span>{data.chapter}</span></header>
    {finished ? <section className="unit-finished">
      <p className="unit-eyebrow">Unit {unitNumber} complete</p><h1 ref={heading} tabIndex={-1}>{milky ? data.title : data.steps.at(-1)!.title}</h1>
      {milky ? <MilkyPhoto data={data} id="panorama" /> : <UnitOpeningPicture data={data} />}
      <div className="unit-glaux"><GlauxArt mood="proud" /><p>{milky ? data.recap.glaux : data.steps.at(-1)!.glaux}</p></div>
      {nextCell && nextCell.kind !== 'quiz' && <p>Next in this chapter: {nextCell.title}.</p>}
      <p className="unit-caption">{!nextReady && 'The next unit is still being prepared. '}Your chapter evaluation will have ten questions after all six units.</p>
      {earned && <p>Learn quest done: +20 XP.</p>}
      <AfterUnitActions content={content} lesson={lesson} onAgain={() => { setFinished(false); setIndex(-1); }} />
    </section> : index < 0 ? <>
      <p className="unit-eyebrow">Chapter 1 · Unit {unitNumber}</p><h1 ref={heading} tabIndex={-1}>{data.title}</h1>
      <div className="unit-introduction"><UnitOpeningPicture data={data} /><div className="unit-prose">{data.introduction.map((p, i) => <p key={i}>{p}</p>)}</div></div>
      <p className="unit-caption">Underlined words open a short definition. Move through the lesson at your own pace.</p>
      <ReadingActions label="Begin the unit"><Button onClick={() => void advance()}>Continue</Button></ReadingActions>
    </> : onRecap ? <>
      <p className="unit-eyebrow">Unit {unitNumber} · Recap</p><h1 ref={heading} tabIndex={-1}>{data.recap.title}</h1>
      <section className="milky-recap"><ol className="milky-recap-points">{data.recap.paragraphs.map(p => <li key={p}>{p}</li>)}</ol><MilkyViewComparison data={data} interactive={false} /></section>
      <div className="unit-glaux"><GlauxArt mood="proud" /><p>{data.recap.glaux}</p></div>
      <ReadingActions label="Unit recap"><Button disabled={busy} onClick={() => void advance()}>Continue</Button><button type="button" className="reading-previous" disabled={busy} onClick={() => setIndex(index - 1)}>Previous</button><span className="reading-count">Recap</span></ReadingActions>
    </> : <>
      <div className="unit-progress"><p className="unit-eyebrow">Unit {unitNumber} · Step {index + 1} of {data.steps.length}</p><progress aria-label="Unit progress" value={index + 1} max={data.steps.length} /></div>
      <h1 ref={heading} tabIndex={-1}>{step.title}</h1>
      <div className="unit-teaching" key={step.id}>
        <div className="unit-teaching-copy"><UnitWords step={step} data={data} />{step.glaux && <div className="unit-glaux"><GlauxArt mood={['recap', 'solar-recap'].includes(step.scene) ? 'proud' : 'gentle'} /><p>{step.glaux}</p></div>}</div>
        <section className="unit-visual" aria-label="Picture and exploration"><TeachingPicture data={data} index={index} /></section>
      </div>
      {milky ? (step.scene === 'galactic-home' || step.scene === 'two-views') && <MilkyPractice key={`practice:${step.id}`} data={data} kind={step.scene === 'galactic-home' ? 'choice' : 'matching'} />
        : isSolarSystemUnit(data) ? (step.scene === 'planet-order' || step.scene === 'pluto') && <SolarPractice key={`practice:${step.id}`} data={data} kind={step.scene === 'planet-order' ? 'order' : 'sorting'} />
        : (step.scene === 'paths' || step.scene === 'comparison') && <OptionalPractice key={`practice:${step.id}`} data={data} kind={step.scene === 'paths' ? 'matching' : 'choice'} />}
      <ReadingActions label="Unit steps"><Button disabled={busy} onClick={() => void advance()}>Continue</Button><button type="button" className="reading-previous" disabled={busy} onClick={() => setIndex(index - 1)}>Previous</button><span className="reading-count">{index + 1} / {data.steps.length}</span></ReadingActions>
    </>}
    {error && <p role="alert">{error}</p>}<Credits data={data} />
  </main></Page>;
}

export function VisualUnit({ lesson, content, reduceMotion }: { lesson: Lesson; content: Content; reduceMotion: boolean }) {
  const [data, setData] = useState<IllustratedUnit>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = lesson.id === 'unit-stars-milky-way' ? loadMilkyWayUnit : lesson.id === 'unit-our-solar-system' ? loadSolarSystemUnit : loadVisualUnit;
    void load(lesson).then(value => { if (active) setData(value); }).catch(problem => { if (active) setError(problem instanceof Error ? problem.message : String(problem)); });
    return () => { active = false; };
  }, [lesson]);
  if (data) return <VisualUnitReader data={data} lesson={lesson} content={content} reduceMotion={reduceMotion} />;
  return <Page className="unit-page" reduceMotion={reduceMotion} skipLabel="Skip to lesson"><main id="main-content" className="unit-main" aria-busy={!error}><h1>Opening the lesson…</h1>{error && <><p role="alert">{error}</p><Button onClick={() => window.location.reload()}>Try again</Button></>}</main></Page>;
}
