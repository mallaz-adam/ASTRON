import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Content, Lesson } from '../data/types';
import { loadVisualUnit, type UnitStep, type VisualUnitData } from '../data/visualUnit';
import { isSolarSystemUnit, loadSolarSystemUnit, type SolarSystemUnitData } from '../data/solarSystemUnit';
import { isMilkyWayUnit, loadMilkyWayUnit, type MilkyWayUnitData } from '../data/milkyWayUnit';
import { isGalaxiesUnit, loadGalaxiesUnit, type GalaxiesUnitData } from '../data/galaxiesUnit';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { finishReadingLesson } from '../data/lessonServices';
import { unitReadingPosition, unitReadingSequence } from '../logic/unitReadingProgress';
import { UnitMatching } from './ObjectMatching';
export { UnitMatching } from './ObjectMatching';
import { Page } from '../design/Page';
import { Button } from '../design/Button';
import { ReadingActions } from '../design/ReadingActions';
import { GlauxArt } from '../design/InlineArt';
import { useReducedMotion } from '../design/useReducedMotion';
import { ObjectGallery, UnitPicture } from './UnitPictures';
import { SolarFamily, SolarSystemPicture } from './SolarSystemPictures';
import { SolarOrderPractice, SolarSortingPractice } from './SolarSystemPractice';
import { MilkyPhoto, MilkyViewComparison, MilkyWayPicture } from './MilkyWayPictures';
import { MilkyChoicePractice, MilkyMatchingPractice } from './MilkyWayPractice';
import { GalaxyHomeMap, GalaxyPhoto, GalaxiesPicture, GalaxyUniverse } from './GalaxiesPictures';
import { GalaxiesPractice } from './GalaxiesPractice';
import { useProgress } from '../hooks/useProgress';
import { nextReadingDestination } from '../logic/readingFlow';
import { milkyReadingPosition } from '../logic/milkyWay';
import { galaxyReadingPosition } from '../logic/galaxies';
import { practiceAfterScene } from '../logic/unitPractice';
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

export function UnitChoice({ data, onAttempt }: { data: VisualUnitData; onAttempt?: () => void }) {
  const [choice, setChoice] = useState('');
  const [checked, setChecked] = useState(false);
  const response = useRef<HTMLDivElement>(null);
  const option = data.choice.options.find(item => item.id === choice);
  useEffect(() => {
    if (!checked) return;
    response.current?.focus({ preventScroll: true });
    response.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [checked]);
  return <div className="unit-practice-content"><fieldset className="unit-choices"><legend>{data.choice.prompt}</legend>{data.choice.options.map(item => <label key={item.id}>
    <input type="radio" name="unit-moonlight" value={item.id} checked={item.id === choice} onChange={() => { setChoice(item.id); setChecked(false); }} /><span>{item.id}. {item.text}</span>
  </label>)}</fieldset>
    <details className="unit-hint"><summary>Hint from Glaux</summary><p>{data.choice.hint}</p></details>
    <Button variant="secondary" disabled={!choice} onClick={() => { setChecked(true); if (option) onAttempt?.(); }}>Explore the answer</Button>
    <div ref={response} tabIndex={-1} className={checked ? 'unit-feedback' : undefined} role="status" aria-live="polite" aria-atomic="true" aria-label="Moonlight feedback">{checked && option && <><GlauxArt mood={choice === data.choice.correct ? 'proud' : 'gentle'} /><p>{option.feedback}</p>{choice === data.choice.correct && <p>{data.choice.explanation}</p>}</>}</div>
  </div>;
}

type IllustratedUnit = VisualUnitData | SolarSystemUnitData | MilkyWayUnitData | GalaxiesUnitData;

function PracticeBody({ data, kind, questionIndex, onAttempt }: { data: IllustratedUnit; kind: string; questionIndex: number; onAttempt: () => void }) {
  if (isGalaxiesUnit(data)) return <GalaxiesPractice data={data} kind={kind === 'choice' ? 'choice' : 'evidence'} questionIndex={questionIndex} onAttempt={onAttempt} />;
  if (isMilkyWayUnit(data)) return kind === 'choice' ? <MilkyChoicePractice data={data} onAttempt={onAttempt} /> : <MilkyMatchingPractice data={data} onAttempt={onAttempt} />;
  if (isSolarSystemUnit(data)) return kind === 'order' ? <SolarOrderPractice data={data} onAttempt={onAttempt} /> : <SolarSortingPractice data={data} onAttempt={onAttempt} />;
  return kind === 'matching' ? <UnitMatching data={data} onAttempt={onAttempt} /> : <UnitChoice data={data} onAttempt={onAttempt} />;
}

function Credits({ data }: { data: IllustratedUnit }) {
  return <details className="unit-credits"><summary>Pictures and sources</summary>
    {data.objects.map(object => <p key={object.id}><a href={object.source} target="_blank" rel="noreferrer">{object.name}: {object.credit}</a><span>{object.caption} {'changes' in object ? object.changes : 'Resized and compressed for ASTRON.'}</span>{'license' in object && ('licenseUrl' in object ? <a href={object.licenseUrl} target="_blank" rel="noreferrer">{object.license}</a> : <span>{object.license}</span>)}</p>)}
    <ul>{data.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul>
  </details>;
}

function UnitOpeningPicture({ data }: { data: IllustratedUnit }) {
  if (isGalaxiesUnit(data)) return <div className="galaxy-opening"><GalaxyHomeMap interactive={false} /></div>;
  if (isMilkyWayUnit(data)) return <MilkyPhoto data={data} id="sky" />;
  return isSolarSystemUnit(data) ? <SolarFamily data={data} interactive={false} /> : <ObjectGallery objects={data.objects} interactive={false} />;
}

function TeachingPicture({ data, index }: { data: IllustratedUnit; index: number }) {
  if (isGalaxiesUnit(data)) return <GalaxiesPicture scene={data.steps[index].scene} data={data} />;
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
  const [practicing, setPracticing] = useState(false);
  const [visitedPractices, setVisitedPractices] = useState<number[]>([]);
  const [attemptedPractices, setAttemptedPractices] = useState<string[]>([]);
  const [practiceQuestions, setPracticeQuestions] = useState<Record<number, number>>({});
  const saving = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const step = data.steps[index];
  const practice = practiceAfterScene(data.lessonId, step?.scene ?? '');
  const questionIndex = practiceQuestions[index] ?? 0;
  const reduced = useReducedMotion(reduceMotion);
  const milky = isMilkyWayUnit(data);
  const galaxies = isGalaxiesUnit(data);
  const recap = milky || galaxies ? data.recap : undefined;
  const onRecap = !!recap && (galaxies ? galaxyReadingPosition : milkyReadingPosition)(index, data.steps.length) === 'recap';
  const lastReadingIndex = data.steps.length - 1 + (recap ? 1 : 0);
  const unitNumber = isSolarSystemUnit(data) || milky || galaxies ? data.unitNumber : 1;
  const sequence = unitReadingSequence(data.lessonId, data.steps, Boolean(recap), galaxies ? { reconstruction: data.evidence.questions.length } : {});
  const position = unitReadingPosition(sequence, { index, practicing, question: questionIndex, finished });
  const count = `${position.current} / ${position.total}`;
  const cell = content.cells.find(row => row.id === lesson.cellId)!;
  const nextCell = content.cells.filter(row => row.unitId === cell.unitId && row.positionNo > cell.positionNo).sort((a, b) => a.positionNo - b.positionNo)[0];
  const nextReady = nextCell && content.lessons.some(row => row.cellId === nextCell.id && !row.placeholder);
  useEffect(() => { document.title = `${data.title} · ASTRON`; }, [data.title]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [index, finished, practicing, questionIndex]);
  function enterPractice(at: number) {
    setIndex(at); setPracticing(true);
    setVisitedPractices(previous => previous.includes(at) ? previous : [...previous, at]);
  }
  function previous() {
    if (practicing) {
      if (questionIndex > 0) setPracticeQuestions(previous => ({ ...previous, [index]: questionIndex - 1 }));
      else setPracticing(false);
      return;
    }
    const at = index - 1;
    if (practiceAfterScene(data.lessonId, data.steps[at]?.scene ?? '')) enterPractice(at);
    else setIndex(at);
  }
  async function advance() {
    if (saving.current) return;
    if (practicing) {
      if (!attemptedPractices.includes(`${index}:${questionIndex}`)) return;
      if (galaxies && practice?.kind === 'evidence' && questionIndex < data.evidence.questions.length - 1) {
        setPracticeQuestions(previous => ({ ...previous, [index]: questionIndex + 1 })); return;
      }
      setPracticing(false); setIndex(index + 1); return;
    }
    if (practice) { enterPractice(index); return; }
    if (index < lastReadingIndex) { setIndex(index + 1); return; }
    saving.current = true; setBusy(true); setError('');
    try {
      const result = await finishReadingLesson(db, content, localLearnerId, lesson.id, new Date());
      setEarned(result.learnQuestEarned); setFinished(true);
    } catch (problem) { setError(problem instanceof Error ? problem.message : String(problem)); }
    finally { saving.current = false; setBusy(false); }
  }
  return <Page className={`unit-page${unitNumber === 2 ? ' solar-unit' : ''}${milky ? ' milky-unit' : ''}${galaxies ? ' galaxy-unit' : ''}`} reduceMotion={reduced} skipLabel="Skip to lesson"><main id="main-content" className="unit-main" aria-busy={busy}>
    <header className="unit-header"><Link to="/learn">Back to the path</Link><span>{data.chapter}</span></header>
    <div className="unit-progress"><p className="unit-eyebrow">Unit {unitNumber} · Step {position.current} of {position.total}</p><progress aria-label="Unit progress" aria-valuetext={`Step ${position.current} of ${position.total}`} value={position.current} max={position.total} /></div>
    {finished ? <section className="unit-finished">
      <p className="unit-eyebrow">Unit {unitNumber} complete</p><h1 ref={heading} tabIndex={-1}>{recap ? data.title : data.steps.at(-1)!.title}</h1>
      {galaxies ? <GalaxyPhoto data={data} id="deep-field" /> : milky ? <MilkyPhoto data={data} id="panorama" /> : <UnitOpeningPicture data={data} />}
      <div className="unit-glaux"><GlauxArt mood="proud" /><p>{recap ? recap.glaux : data.steps.at(-1)!.glaux}</p></div>
      {nextCell && nextCell.kind !== 'quiz' && <p>Next in this chapter: {nextCell.title}.</p>}
      <p className="unit-caption">{!nextReady && 'The next unit is still being prepared. '}Your chapter evaluation will have ten questions after all six units.</p>
      {earned && <p>Learn quest done: +20 XP.</p>}
      <AfterUnitActions content={content} lesson={lesson} onAgain={() => { setFinished(false); setIndex(-1); setPracticing(false); setVisitedPractices([]); setAttemptedPractices([]); setPracticeQuestions({}); }} />
    </section> : index < 0 ? <>
      <p className="unit-eyebrow">Chapter 1 · Unit {unitNumber}</p><h1 ref={heading} tabIndex={-1}>{data.title}</h1>
      <div className="unit-introduction">{galaxies ? <><div className="unit-prose">{data.introduction.map((p, i) => <p key={i}>{p}</p>)}</div><UnitOpeningPicture data={data} /></>
        : <><UnitOpeningPicture data={data} /><div className="unit-prose">{data.introduction.map((p, i) => <p key={i}>{p}</p>)}</div></>}</div>
      <p className="unit-caption">Underlined words open a short definition. Move through the lesson at your own pace.</p>
      <ReadingActions label="Begin the unit"><Button onClick={() => void advance()}>Continue</Button><span className="reading-count">{count}</span></ReadingActions>
    </> : practicing && practice ? <>
      <header className="unit-practice-heading"><p className="unit-eyebrow">Practice</p>
      <h1 ref={heading} tabIndex={-1}>{practice.title}</h1></header>
    </> : onRecap && recap ? <>
      <p className="unit-eyebrow">Unit {unitNumber} · Recap</p><h1 ref={heading} tabIndex={-1}>{recap.title}</h1>
      {galaxies ? <section className="galaxy-recap"><ol>{recap.paragraphs.map(p => <li key={p}>{p}</li>)}</ol><GalaxyUniverse /></section>
        : milky && <section className="milky-recap"><ol className="milky-recap-points">{recap.paragraphs.map(p => <li key={p}>{p}</li>)}</ol><MilkyViewComparison data={data} interactive={false} /></section>}
      <div className="unit-glaux"><GlauxArt mood="proud" /><p>{recap.glaux}</p></div>
      <ReadingActions label="Unit recap"><Button disabled={busy} onClick={() => void advance()}>Continue</Button><button type="button" className="reading-previous" disabled={busy} onClick={previous}>Previous</button><span className="reading-count">{count}</span></ReadingActions>
    </> : <>
      <h1 ref={heading} tabIndex={-1}>{step.title}</h1>
      <div className="unit-teaching" key={step.id}>
        <div className="unit-teaching-copy"><UnitWords step={step} data={data} />{step.glaux && <div className="unit-glaux"><GlauxArt mood={['recap', 'solar-recap'].includes(step.scene) ? 'proud' : 'gentle'} /><p>{step.glaux}</p></div>}{galaxies && <p className="galaxy-invitation">{data.steps[index].invitation}</p>}</div>
        <section className="unit-visual" aria-label="Picture and exploration"><TeachingPicture data={data} index={index} /></section>
      </div>
      <ReadingActions label="Unit steps"><Button disabled={busy} onClick={() => void advance()}>Continue</Button><button type="button" className="reading-previous" disabled={busy} onClick={previous}>Previous</button><span className="reading-count">{count}</span></ReadingActions>
    </>}
    {!finished && visitedPractices.map(at => {
      const item = practiceAfterScene(data.lessonId, data.steps[at].scene)!;
      const active = practicing && index === at;
      const position = practiceQuestions[at] ?? 0;
      const attemptKey = `${at}:${position}`;
      const attempted = attemptedPractices.includes(attemptKey);
      // Keep visited forms mounted so Previous preserves answers and feedback.
      return <section key={at} className="unit-practice-stage" hidden={!active} aria-label={item.title}>
        <PracticeBody data={data} kind={item.kind} questionIndex={position} onAttempt={() => setAttemptedPractices(previous => previous.includes(attemptKey) ? previous : [...previous, attemptKey])} />
        <p id={`practice-guidance-${at}`} className="unit-caption">Try the question, then read the feedback. You can continue after any complete attempt.</p>
        <p className="unit-practice-status" role="status">{attempted ? 'Feedback explored. Continue when you are ready.' : 'Complete an attempt to continue.'}</p>
        <ReadingActions label="Practice steps"><Button disabled={!attempted} aria-describedby={`practice-guidance-${at}`} onClick={() => void advance()}>Continue</Button><button type="button" className="reading-previous" onClick={previous}>Previous</button><span className="reading-count">{count}</span></ReadingActions>
      </section>;
    })}
    {error && <p role="alert">{error}</p>}<Credits data={data} />
  </main></Page>;
}

export function VisualUnit({ lesson, content, reduceMotion }: { lesson: Lesson; content: Content; reduceMotion: boolean }) {
  const [data, setData] = useState<IllustratedUnit>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = lesson.id === 'unit-galaxies-universe' ? loadGalaxiesUnit : lesson.id === 'unit-stars-milky-way' ? loadMilkyWayUnit : lesson.id === 'unit-our-solar-system' ? loadSolarSystemUnit : loadVisualUnit;
    void load(lesson).then(value => { if (active) setData(value); }).catch(problem => { if (active) setError(problem instanceof Error ? problem.message : String(problem)); });
    return () => { active = false; };
  }, [lesson]);
  if (data) return <VisualUnitReader data={data} lesson={lesson} content={content} reduceMotion={reduceMotion} />;
  return <Page className="unit-page" reduceMotion={reduceMotion} skipLabel="Skip to lesson"><main id="main-content" className="unit-main" aria-busy={!error}><h1>Opening the lesson…</h1>{error && <><p role="alert">{error}</p><Button onClick={() => window.location.reload()}>Try again</Button></>}</main></Page>;
}
