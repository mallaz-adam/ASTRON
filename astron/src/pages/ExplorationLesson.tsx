import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Content, Exercise, Lesson } from '../data/types';
import { loadExplorationLesson, type ExplorationLesson as LessonData } from '../data/explorationLesson';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { finishReadingLesson } from '../data/lessonServices';
import { Page } from '../design/Page';
import { Button } from '../design/Button';
import { ReadingActions } from '../design/ReadingActions';
import { DiscoveryDetails } from '../design/DiscoveryDetails';
import { GlauxArt } from '../design/InlineArt';
import { correctSelection, exerciseItems } from '../logic/lessonPlayer';
import { nextReadingDestination, readingSteps, type ReadingStep } from '../logic/readingFlow';
import { useProgress } from '../hooks/useProgress';
import { ExplorationDiagram } from './ExplorationDiagrams';
import './ExplorationLesson.css';

export function GuidedPractice({ exercise }: { exercise: Exercise }) {
  const [choice, setChoice] = useState('');
  const [revealed, setRevealed] = useState(false);
  const correct = correctSelection(exercise)[0];
  return <div className="exploration-practice">
    <p>This is optional practice. Take your time; you can continue with the lesson.</p>
    <fieldset className="exploration-options">
      <legend>{exercise.prompt}</legend>
      {exerciseItems(exercise).map(item => <label key={item.id}>
        <input type="radio" name={exercise.id} value={item.id} checked={choice === item.id}
          onChange={() => { setChoice(item.id); setRevealed(false); }} />
        <span>{item.text}</span>
      </label>)}
    </fieldset>
    <Button variant="secondary" disabled={!choice} onClick={() => setRevealed(true)}>Explore the answer</Button>
    {revealed && <div className="exploration-practice-feedback" role="status">
      <p>{choice === correct ? exercise.rightLine : exercise.missedLine}</p>
      <p>{exercise.explanation}</p>
    </div>}
  </div>;
}

export function ReadingStepContent({ step }: { step: ReadingStep }) {
  const showPicture = step.explore && step.section.diagram !== 'recap';
  return <>
    <div className={`exploration-layout${showPicture ? ' exploration-layout--picture' : ''}`}>
      <div className="exploration-prose">{step.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      {showPicture && <aside className="exploration-visual" aria-label="Explore the idea">
        <ExplorationDiagram kind={step.section.diagram} />
      </aside>}
    </div>
    {!step.explore && <div className="exploration-glaux"><GlauxArt mood="gentle" /><p>{step.section.glaux}</p></div>}
  </>;
}

export function ExplorationReader({ data, lesson, content, reduceMotion }: {
  data: LessonData; lesson: Lesson; content: Content; reduceMotion: boolean;
}) {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [learnQuestEarned, setLearnQuestEarned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const writing = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const { progress, error: progressError } = useProgress();
  const steps = readingSteps(data);
  const current = steps[stepIndex];
  const practice = current.explore && data.practice.find(item => item.sectionId === current.section.id);
  const exercise = practice && content.exercises.find(item => item.id === practice.exerciseId);
  const destination = nextReadingDestination(content, progress, localLearnerId, lesson.cellId);

  useEffect(() => { document.title = `${lesson.title} · ASTRON`; }, [lesson.title]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [stepIndex, finished, started]);

  async function finish() {
    if (writing.current) return;
    writing.current = true;
    setBusy(true); setError('');
    try {
      const result = await finishReadingLesson(db, content, localLearnerId, lesson.id, new Date());
      setLearnQuestEarned(result.learnQuestEarned);
      setFinished(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem));
    } finally {
      writing.current = false; setBusy(false);
    }
  }

  return <Page className="exploration-page" reduceMotion={reduceMotion} skipLabel="Skip to lesson">
    <main id="main-content" className={`exploration-main${started && !finished && current.explore ? ' exploration-main--explore' : ''}`} tabIndex={-1} aria-busy={busy}>
      <header className="exploration-header"><Link to="/learn">Back to the path</Link>{started && <span>{lesson.title}</span>}</header>
      {!started ? <>
        <p className="exploration-eyebrow">Before we begin</p>
        <h1 ref={heading} tabIndex={-1}>{lesson.title}</h1>
        <div className="exploration-prose"><p>{data.introduction}</p></div>
        <ReadingActions label="Begin the lesson"><Button onClick={() => setStarted(true)}>Continue</Button></ReadingActions>
      </> : finished ? <>
        <p className="exploration-eyebrow">Lesson complete</p>
        <h1 ref={heading} tabIndex={-1}>Your place in the cosmos</h1>
        <div className="exploration-glaux"><GlauxArt mood="proud" /><p>You have found our place. Let us carry these ideas a little further.</p></div>
        <p className="exploration-note">The full evaluation comes at the end of the chapter, How stars live and die.</p>
        {learnQuestEarned && <p>Learn quest done: +20 XP.</p>}
        {destination && destination.to !== '/learn' && <p className="exploration-note">Next: {destination.title}</p>}
        <ReadingActions label="After the lesson">
          {destination ? <Link className="atlas-button atlas-button--primary" to={destination.to}>Continue</Link> : <Button disabled>Continue</Button>}
          <button type="button" className="reading-previous" onClick={() => { setStepIndex(0); setFinished(false); setStarted(false); }}>Read again</button>
        </ReadingActions>
      </> : <>
        <div className="exploration-progress">
          <p className="exploration-eyebrow">Step {stepIndex + 1} of {steps.length}</p>
          <progress aria-label="Lesson progress" value={stepIndex + 1} max={steps.length} />
        </div>
        <h1 ref={heading} tabIndex={-1}>{current.section.title}</h1>
        <ReadingStepContent key={current.id} step={current} />
        {exercise && <DiscoveryDetails key={exercise.id} detailId={`lesson:${lesson.id}:practice:${exercise.id}`} label="Try this idea (optional)">
          <GuidedPractice exercise={exercise} />
        </DiscoveryDetails>}
        <ReadingActions label="Lesson steps">
          <Button disabled={busy} onClick={() => stepIndex < steps.length - 1 ? setStepIndex(stepIndex + 1) : void finish()}>Continue</Button>
          <button type="button" className="reading-previous" disabled={busy} onClick={() => stepIndex > 0 ? setStepIndex(stepIndex - 1) : setStarted(false)}>Previous</button>
        </ReadingActions>
      </>}
      {started && (finished || stepIndex === steps.length - 1) && <DiscoveryDetails emphasis="quiet" detailId={`lesson:${lesson.id}:sources`} label="Sources">
          <ul className="exploration-sources">{data.sources.map(source => <li key={source.url}>
            <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
          </li>)}</ul>
        </DiscoveryDetails>}
      {error && <p role="alert">{error}</p>}
      {progressError && <p role="alert">{progressError}</p>}
    </main>
  </Page>;
}

export function ExplorationLesson({ lesson, content, reduceMotion }: { lesson: Lesson; content: Content; reduceMotion: boolean }) {
  const [data, setData] = useState<LessonData>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void loadExplorationLesson(lesson, content).then(value => { if (active) setData(value); })
      .catch(problem => { if (active) setError(String(problem.message)); });
    return () => { active = false; };
  }, [lesson, content]);
  if (!data) return <Page className="exploration-page" reduceMotion={reduceMotion} skipLabel="Skip to lesson">
    <main id="main-content" aria-busy={!error}><h1>Opening the lesson…</h1>{error && <>
      <p role="alert">{error}</p><Button onClick={() => window.location.reload()}>Try again</Button>
    </>}</main>
  </Page>;
  return <ExplorationReader data={data} lesson={lesson} content={content} reduceMotion={reduceMotion} />;
}
