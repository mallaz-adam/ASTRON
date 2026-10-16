import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Content, Exercise, HunchChoice, Lesson } from '../data/types';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { finishLesson, saveLessonAnswer } from '../data/lessonServices';
import { Button } from '../design/Button';
import { Page } from '../design/Page';
import { ProgressSegments } from '../design/ProgressSegments';
import { LessonArt, RecapStar } from '../design/LessonArt';
import { checkExercise, chooseHunch, firstTryCount, newLessonRun, revealExercise, selectItem, showCard, undoItem, useHint, visibleCardCount } from '../logic/lessonPlayer';
import { newReactionMemory, reactGlaux, rightEvent } from '../logic/glauxReactions';
import type { GlauxReaction, ReactionEvent } from '../logic/glauxReactions';
import { LessonExercise } from './LessonExercise';
import { LessonGlaux } from './LessonGlaux';
import './LessonPlayer.css';

type End = Awaited<ReturnType<typeof finishLesson>>;

export function LessonPlayer({ lesson, content, reduceMotion, completedBefore = false }: { lesson: Lesson; content: Content; reduceMotion: boolean; completedBefore?: boolean }) {
  const navigate = useNavigate();
  const [run, setRun] = useState(() => newLessonRun(lesson));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [end, setEnd] = useState<End>();
  const [showingEnd, setShowingEnd] = useState(false);
  const [reactions, setReactions] = useState<Record<string, GlauxReaction>>({});
  const reactionMemory = useRef(newReactionMemory());
  const saving = useRef(false);
  const finishing = useRef(false);
  const resetting = useRef(false);
  const practicing = useRef(completedBefore);
  const scroll = useRef<HTMLDivElement>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const visible = visibleCardCount(run);
  const total = lesson.cards.length;
  const allDone = run.done.every(Boolean);

  useEffect(() => { setRun(value => showCard(value, lesson, 0)); }, [lesson]);
  useEffect(() => { document.title = `${lesson.title} · ASTRON`; }, [lesson.title]);

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
    setShowingEnd(index >= total);
    if (index < total) setRun(value => showCard(value, lesson, index));
  }
  function arrows(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('input, textarea, select')) return;
    if (showingEnd) {
      if (event.key === 'ArrowUp') { event.preventDefault(); move(total - 1); }
      return;
    }
    if (event.key === 'ArrowUp' && run.active > 0) {
      event.preventDefault(); move(run.active - 1);
    }
    if (event.key === 'ArrowDown' && run.done[run.active]) {
      event.preventDefault(); move(Math.min(run.active + 1, end ? total : visible - 1));
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
    if (finishing.current) return;
    finishing.current = true; setBusy(true); setError('');
    try {
      const revealed = Object.entries(run.answers).filter(([, answer]) => answer.status === 'revealed').map(([id]) => id);
      const result = await finishLesson(db, content, localLearnerId, lesson.id, revealed, new Date());
      setEnd({ ...result, correctAnswers: practicing.current ? firstTryCount(run) : result.correctAnswers });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem));
      finishing.current = false;
    } finally { setBusy(false); }
  }
  useEffect(() => { if (allDone) void finish(); }, [allDone]);

  function again() {
    resetting.current = true;
    scroll.current?.scrollTo({ top: 0, behavior: 'instant' });
    setEnd(undefined); setError(''); setShowingEnd(false); finishing.current = false;
    practicing.current = true;
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
          const reaction = exercise ? reactions[exercise.id] : card.kind === 'hunch' ? reactions.hunch : undefined;
          const lines = reaction?.lines ?? (exercise ? [exercise.glaux] : card.kind !== 'exercise' ? (Array.isArray(card.glaux) ? card.glaux : [card.glaux]) : []);
          const placeholder = ['dial', 'mass', 'race', 'gap'].includes(card.kind);
          const art = card.kind !== 'exercise' ? card.art ?? (placeholder ? 'lesson-03-colours' : undefined) : undefined;
          return <section className="lesson-card" aria-label={`Card ${index + 1} of ${total}`} key={index} ref={node => { sections.current[index] = node; }}>
            {art && <LessonArt name={art} />}
            <LessonGlaux mood={reaction?.mood ?? (card.kind === 'exercise' ? 'happy' : card.mood)} lines={lines} reaction={reaction} reduceMotion={reduceMotion} />
            {'text' in card && <p className="lesson-body">{card.text}</p>}
            {placeholder && <p className="lesson-placeholder">Interactive card arrives in the next step.</p>}
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
            {card.kind === 'recap' && <ul className="lesson-recap">{card.items.map(item => <li key={item}><RecapStar /><span>{item}</span></li>)}</ul>}
            {exercise && answer && <>
              {(answer.status === 'correct' || answer.status === 'revealed') && <p className="lesson-explanation">{exercise.explanation}</p>}
              <LessonExercise exercise={exercise} answer={answer} busy={busy}
                select={id => setRun(value => selectItem(value, exercise, id))} undo={() => setRun(value => undoItem(value, exercise))}
                check={() => void check(exercise.id, index)} reveal={() => reveal(exercise)} hint={() => hint(exercise)} />
            </>}
            {error && run.active === index && <p role="alert">{error}</p>}
            {(card.kind !== 'hunch' || run.hunch) && <Button className="lesson-continue" disabled={!run.done[index] || busy || (index === total - 1 && !end && !error)}
              onClick={() => { if (index === total - 1 && !end) void finish(); else move(index + 1); }}>CONTINUE</Button>
            }
          </section>;
        })}
        {end && <section className="lesson-card lesson-end" aria-label="LESSON COMPLETE" ref={node => { sections.current[total] = node; }}>
          <h1>LESSON COMPLETE</h1>
          <LessonGlaux mood="proud" lines={[`${end.correctAnswers} of ${Object.keys(run.answers).length} right on the first try.`]} reduceMotion={reduceMotion} />
          {end.learnQuestEarned && <p>Learn quest done: <span className="lesson-number">+20 XP</span>.</p>}
          <Link className="atlas-button atlas-button--primary lesson-path" to="/learn">BACK TO THE PATH</Link>
          <Button variant="secondary" onClick={again}>AGAIN</Button>
        </section>}
      </div>
    </main>
  </Page>;
}
