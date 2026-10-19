import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Content, Exercise, HunchChoice, Lesson } from '../data/types';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { finishLesson, saveLessonAnswer } from '../data/lessonServices';
import { Button } from '../design/Button';
import { Page } from '../design/Page';
import { ProgressSegments } from '../design/ProgressSegments';
import { LessonArt } from '../design/LessonArt';
import { checkExercise, chooseHunch, completeRecap, newLessonRun, revealExercise, selectItem, showCard, undoItem, useHint, visibleCardCount } from '../logic/lessonPlayer';
import { newReactionMemory, reactGlaux, rightEvent } from '../logic/glauxReactions';
import type { GlauxReaction, ReactionEvent } from '../logic/glauxReactions';
import { LessonExercise } from './LessonExercise';
import { LessonGlaux } from './LessonGlaux';
import { InteractiveCard } from './InteractiveCards';
import { useReducedMotion } from '../design/useReducedMotion';
import { LessonRecap } from './LessonRecap';
import './LessonPlayer.css';

type End = Awaited<ReturnType<typeof finishLesson>>;

export function LessonPlayer({ lesson, content, reduceMotion: savedMotion }: { lesson: Lesson; content: Content; reduceMotion: boolean }) {
  const reduceMotion = useReducedMotion(savedMotion);
  const navigate = useNavigate();
  const [run, setRun] = useState(() => newLessonRun(lesson));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [end, setEnd] = useState<End>();
  const [reactions, setReactions] = useState<Record<string, GlauxReaction>>({});
  const reactionMemory = useRef(newReactionMemory());
  const saving = useRef(false);
  const finishing = useRef(false);
  const resetting = useRef(false);
  const scroll = useRef<HTMLDivElement>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const visible = visibleCardCount(run);
  const total = lesson.cards.length;

  useEffect(() => { setRun(value => showCard(value, lesson, 0)); }, [lesson]);
  useEffect(() => { document.title = `${lesson.title} · ASTRON`; }, [lesson.title]);
  useLayoutEffect(() => {
    if (!end) return;
    const recap = sections.current[total - 1];
    recap?.focus({ preventScroll: true });
    if (recap) scroll.current?.scrollTo({ top: recap.offsetTop, behavior: 'instant' });
  }, [end, total]);

  function move(index: number) {
    const section = sections.current[index];
    if (!section || !scroll.current) return;
    const stopped = reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroll.current.scrollTo({ top: section.offsetTop, behavior: stopped ? 'instant' : 'smooth' });
  }
  function shown() {
    if (!scroll.current || resetting.current) return;
    const probe = scroll.current.scrollTop + Math.min(120, scroll.current.clientHeight * .35);
    let index = 0;
    sections.current.forEach((section, position) => { if (section && section.offsetTop <= probe) index = position; });
    if (index < total) setRun(value => showCard(value, lesson, index));
  }
  function arrows(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('input, textarea, select')) return;
    if (event.key === 'ArrowUp' && run.active > 0) {
      event.preventDefault(); move(run.active - 1);
    }
    if (event.key === 'ArrowDown' && run.done[run.active] && run.active < visible - 1) {
      event.preventDefault(); move(run.active + 1);
    }
  }
  function react(event: ReactionEvent, key: string, exercise?: Exercise, hunch = run.hunch) {
    const result = reactGlaux({ event, memory: reactionMemory.current, pools: content.glauxLines,
      exercise, hunch, lineRoll: Math.random(), sneezeRoll: Math.random() });
    reactionMemory.current = result.memory;
    setReactions(value => ({ ...value, [key]: result.reaction }));
  }
  function hunch(choice: HunchChoice) {
    setRun(value => chooseHunch(value, lesson, choice));
    react('hunch', 'hunch', undefined, choice);
  }
  function hint(exercise: Exercise) {
    setRun(value => useHint(value, exercise));
    react('hint', exercise.id, exercise);
  }
  function reveal(exercise: Exercise) {
    const revealed = revealExercise(run, lesson, exercise);
    if (revealed === run) return;
    setRun(revealed);
    react('showMe', exercise.id, exercise);
  }
  async function check(exerciseId: string, index: number) {
    if (saving.current) return;
    const exercise = content.exercises.find(row => row.id === exerciseId)!;
    const result = checkExercise(run, lesson, exercise);
    saving.current = true; setBusy(true); setError('');
    try {
      await saveLessonAnswer(db, content, localLearnerId, lesson.id, exercise.id, result.correct, new Date());
      setRun(result.run);
      react(result.correct ? rightEvent(result.run.answers[exercise.id]) : 'missed', exercise.id, exercise);
      move(index);
    } catch (problem) { setError(problem instanceof Error ? problem.message : String(problem)); }
    finally { saving.current = false; setBusy(false); }
  }
  async function finish() {
    const completed = completeRecap(run, lesson);
    if (finishing.current || completed === run) return;
    finishing.current = true; setBusy(true); setError('');
    try {
      const revealed = Object.entries(run.answers).filter(([, answer]) => answer.status === 'revealed').map(([id]) => id);
      const result = await finishLesson(db, content, localLearnerId, lesson.id, revealed, new Date(), run.hunch);
      setRun(completed);
      setEnd(result);
      react('ending', 'ending');
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem));
      finishing.current = false;
    } finally { setBusy(false); }
  }

  function again() {
    resetting.current = true;
    scroll.current?.scrollTo({ top: 0, behavior: 'instant' });
    setEnd(undefined); setError(''); finishing.current = false;
    setReactions({});
    setRun(showCard(newLessonRun(lesson), lesson, 0));
    requestAnimationFrame(() => {
      scroll.current?.scrollTo({ top: 0, behavior: 'instant' });
      sections.current[0]?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
      resetting.current = false;
    });
  }

  return <Page className="lesson-page" reduceMotion={reduceMotion} skipLabel={lesson.title}>
    <main id="main-content" className="lesson-shell" tabIndex={-1}>
      <h1 className="lesson-title">{lesson.title}</h1>
      <header className="lesson-topbar">
        <button className="lesson-close" type="button" aria-label="Close lesson" onClick={() => navigate('/learn')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
        <div aria-live="polite"><ProgressSegments label={`Card ${run.active + 1} of ${total}`} filled={run.done.filter(Boolean).length} total={total} /></div>
      </header>
      <div className="lesson-scroll" ref={scroll} onScroll={shown} onKeyDown={arrows}>
        {lesson.cards.slice(0, visible).map((card, index) => {
          const exercise = card.kind === 'exercise' ? content.exercises.find(row => row.id === card.exerciseId)! : undefined;
          const answer = exercise ? run.answers[exercise.id] : undefined;
          const reaction = exercise ? reactions[exercise.id] : card.kind === 'hunch' ? reactions.hunch : reactions[`card-${index}`];
          const lines = reaction?.lines ?? (exercise ? [exercise.glaux] : card.kind !== 'exercise' ? (Array.isArray(card.glaux) ? card.glaux : [card.glaux]) : []);
          const interactive = card.kind === 'dial' || card.kind === 'mass' || card.kind === 'race' || card.kind === 'gap';
          const art = card.kind !== 'exercise' && !interactive ? card.art : undefined;
          return <section className="lesson-card" tabIndex={-1} aria-label={card.kind === 'recap' && end ? 'Added to your sky' : `Card ${index + 1} of ${total}`} key={index} ref={node => { sections.current[index] = node; }}>
            {art && <LessonArt name={art} />}
            {!(card.kind === 'recap' && end) && <LessonGlaux mood={reaction?.mood ?? (card.kind === 'exercise' ? 'happy' : card.mood)} lines={lines} reaction={reaction} reduceMotion={reduceMotion} />}
            {'text' in card && <p className="lesson-body">{card.text}</p>}
            {interactive && <InteractiveCard kind={card.kind} reduceMotion={reduceMotion} active={run.active === index}
              react={event => react(event, `card-${index}`)} />}
            {card.kind === 'hunch' && <div className="hunch-controls">
              <div className="hunch-options">
                {card.options.map(option => <button key={option.id} type="button" className="hunch-option"
                  aria-pressed={run.hunch === option.id} disabled={busy} onClick={() => hunch(option.id)}>
                  <span className="hunch-disc" style={{ background: option.colour }} aria-hidden="true" />
                  <span>{option.text}</span>
                </button>)}
              </div>
              <Button variant="secondary" aria-pressed={run.hunch === 'skipped'} disabled={busy} onClick={() => hunch('skipped')}>{card.skipLabel}</Button>
            </div>}
            {card.kind === 'recap' && <LessonRecap items={card.items} finished={!!end} hunch={run.hunch} reduceMotion={reduceMotion} />}
            {card.kind === 'recap' && end && <>
              <div className="lesson-farewell"><LessonGlaux mood="proud" lines={reactions.ending?.lines ?? []} reduceMotion={reduceMotion} /></div>
              {end.learnQuestEarned && <p>Learn quest done: <span className="lesson-number">+20 XP</span>.</p>}
              <div className="lesson-ending-actions">
                <Link className="atlas-button atlas-button--primary lesson-path" to="/learn">BACK TO THE PATH</Link>
                <Button variant="secondary" onClick={again}>AGAIN</Button>
              </div>
            </>}
            {exercise && answer && <>
              {(answer.status === 'correct' || answer.status === 'revealed') && <p className="lesson-explanation">{exercise.explanation}</p>}
              <LessonExercise exercise={exercise} answer={answer} busy={busy} reduceMotion={reduceMotion} active={run.active === index}
                select={id => setRun(value => selectItem(value, exercise, id))} undo={() => setRun(value => undoItem(value, exercise))}
                check={() => void check(exercise.id, index)} reveal={() => reveal(exercise)} hint={() => hint(exercise)} />
            </>}
            {error && run.active === index && <p role="alert">{error}</p>}
            {!(card.kind === 'recap' && end) && (card.kind !== 'hunch' || run.hunch) && <Button className="lesson-continue" disabled={busy || (card.kind === 'recap' ? run.active !== index || !run.done.slice(0, index).every(Boolean) : !run.done[index])}
              onClick={() => { if (index === total - 1 && !end) void finish(); else move(index + 1); }}>CONTINUE</Button>
            }
          </section>;
        })}
      </div>
    </main>
  </Page>;
}
