import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Content, GlauxMood, Lesson } from '../data/types';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { finishLesson, saveLessonAnswer } from '../data/lessonServices';
import { Button } from '../design/Button';
import { Page } from '../design/Page';
import { ProgressSegments } from '../design/ProgressSegments';
import { GlauxArt } from '../design/InlineArt';
import { LessonArt, RecapStar } from '../design/LessonArt';
import { SpeechBox } from '../design/SpeechBox';
import { checkExercise, exerciseSpeech, firstTryCount, newLessonRun, revealExercise, selectItem, showCard, undoItem, visibleCardCount } from '../logic/lessonPlayer';
import { LessonExercise } from './LessonExercise';
import './LessonPlayer.css';

function GlauxSpeech({ mood, lines }: { mood: GlauxMood; lines: string[] }) {
  return <div className="lesson-speech"><GlauxArt mood={mood} className="lesson-glaux" /><SpeechBox><div role="status" aria-live="polite">{lines.map(line => <p key={line}>{line}</p>)}</div></SpeechBox></div>;
}
type End = Awaited<ReturnType<typeof finishLesson>>;

export function LessonPlayer({ lesson, content, reduceMotion, completedBefore = false }: { lesson: Lesson; content: Content; reduceMotion: boolean; completedBefore?: boolean }) {
  const navigate = useNavigate();
  const [run, setRun] = useState(() => newLessonRun(lesson));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [end, setEnd] = useState<End>();
  const [showingEnd, setShowingEnd] = useState(false);
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
  async function check(exerciseId: string, index: number) {
    if (saving.current) return;
    const exercise = content.exercises.find(row => row.id === exerciseId)!;
    const result = checkExercise(run, lesson, exercise);
    saving.current = true; setBusy(true); setError('');
    try {
      await saveLessonAnswer(db, content, localLearnerId, lesson.id, exercise.id, result.correct, new Date());
      setRun(result.run);
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
          const lines = exercise && answer ? exerciseSpeech(exercise, answer) : card.kind !== 'exercise' ? [card.glaux] : [];
          return <section className="lesson-card" aria-label={`Card ${index + 1} of ${total}`} key={index} ref={node => { sections.current[index] = node; }}>
            {card.kind !== 'exercise' && card.art && <LessonArt name={card.art} />}
            <GlauxSpeech mood={card.kind === 'exercise' ? 'happy' : card.mood} lines={lines} />
            {card.kind === 'idea' && <p className="lesson-body">{card.text}</p>}
            {card.kind === 'recap' && <ul className="lesson-recap">{card.items.map(item => <li key={item}><RecapStar /><span>{item}</span></li>)}</ul>}
            {exercise && answer && <>
              {(answer.status === 'correct' || answer.status === 'revealed') && <p className="lesson-explanation">{exercise.explanation}</p>}
              <LessonExercise exercise={exercise} answer={answer} busy={busy}
                select={id => setRun(value => selectItem(value, exercise, id))} undo={() => setRun(value => undoItem(value, exercise))}
                check={() => void check(exercise.id, index)} reveal={() => setRun(value => revealExercise(value, lesson, exercise))} />
            </>}
            {error && run.active === index && <p role="alert">{error}</p>}
            <Button className="lesson-continue" disabled={!run.done[index] || busy || (index === total - 1 && !end && !error)}
              onClick={() => { if (index === total - 1 && !end) void finish(); else move(index + 1); }}>CONTINUE</Button>
          </section>;
        })}
        {end && <section className="lesson-card lesson-end" aria-label="LESSON COMPLETE" ref={node => { sections.current[total] = node; }}>
          <h1>LESSON COMPLETE</h1>
          <GlauxSpeech mood="proud" lines={[`${end.correctAnswers} of ${Object.keys(run.answers).length} right on the first try.`]} />
          {end.learnQuestEarned && <p>Learn quest done: <span className="lesson-number">+20 XP</span>.</p>}
          <Link className="atlas-button atlas-button--primary lesson-path" to="/learn">BACK TO THE PATH</Link>
          <Button variant="secondary" onClick={again}>AGAIN</Button>
        </section>}
      </div>
    </main>
  </Page>;
}
