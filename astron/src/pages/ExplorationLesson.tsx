import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Content, Exercise, Lesson } from '../data/types';
import { loadExplorationLesson, type ExplorationLesson as LessonData } from '../data/explorationLesson';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { finishReadingLesson } from '../data/lessonServices';
import { Page } from '../design/Page';
import { Button } from '../design/Button';
import { DiscoveryDetails } from '../design/DiscoveryDetails';
import { GlauxArt } from '../design/InlineArt';
import { correctSelection, exerciseItems } from '../logic/lessonPlayer';
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

export function ExplorationReader({ data, lesson, content, reduceMotion }: {
  data: LessonData; lesson: Lesson; content: Content; reduceMotion: boolean;
}) {
  const [section, setSection] = useState(0);
  const [finished, setFinished] = useState(false);
  const [learnQuestEarned, setLearnQuestEarned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const writing = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const current = data.sections[section];
  const practice = data.practice.find(item => item.sectionId === current.id);
  const exercise = practice && content.exercises.find(item => item.id === practice.exerciseId);

  useEffect(() => { document.title = `${lesson.title} · ASTRON`; }, [lesson.title]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [section, finished]);

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
    <main id="main-content" className="exploration-main" tabIndex={-1} aria-busy={busy}>
      <header className="exploration-header"><Link to="/learn">Back to the path</Link><span>Scale of the cosmos</span></header>
      {finished ? <>
        <p className="exploration-eyebrow">Lesson complete</p>
        <h1 ref={heading} tabIndex={-1}>Your place in the cosmos</h1>
        <div className="exploration-glaux"><GlauxArt mood="proud" /><p>You have found our place. Let us carry these ideas a little further.</p></div>
        <div className="exploration-prose">
          <p>Earth belongs to our solar system. Our solar system belongs to the Milky Way.</p>
          <p>Sizes and distances are different comparisons. A good model tells you what it preserves.</p>
          <p>The full evaluation comes at the end of the chapter, How stars live and die.</p>
        </div>
        {learnQuestEarned && <p>Learn quest done: +20 XP.</p>}
        <nav className="exploration-actions" aria-label="After the lesson">
          <Link className="atlas-button atlas-button--primary" to="/learn">Back to the path</Link>
          <Button variant="secondary" onClick={() => { setSection(0); setFinished(false); }}>Read again</Button>
        </nav>
      </> : <>
        <p className="exploration-eyebrow">Lesson 1 · Part {section + 1} of {data.sections.length}</p>
        <h1 ref={heading} tabIndex={-1}>{current.title}</h1>
        {section === 0 && <p className="exploration-introduction">{data.introduction}</p>}
        <label className="exploration-contents">Lesson contents
          <select value={section} onChange={event => setSection(Number(event.target.value))}>
            {data.sections.map((item, index) => <option key={item.id} value={index}>{index + 1}. {item.title}</option>)}
          </select>
        </label>
        <div className="exploration-layout">
          <div className="exploration-prose">{current.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <aside className="exploration-visual" aria-label="Explore the idea"><ExplorationDiagram key={current.id} kind={current.diagram} /></aside>
        </div>
        <div className="exploration-glaux"><GlauxArt mood="gentle" /><p>{current.glaux}</p></div>
        {exercise && <DiscoveryDetails key={exercise.id} detailId={`lesson:${lesson.id}:practice:${exercise.id}`} label="Try this idea (optional)">
          <GuidedPractice exercise={exercise} />
        </DiscoveryDetails>}
        <nav className="exploration-actions" aria-label="Lesson sections">
          <Button variant="secondary" disabled={section === 0 || busy} onClick={() => setSection(section - 1)}>Previous</Button>
          {section < data.sections.length - 1
            ? <Button onClick={() => setSection(section + 1)}>Continue</Button>
            : <Button disabled={busy} onClick={() => void finish()}>Finish lesson</Button>}
        </nav>
        <DiscoveryDetails detailId={`lesson:${lesson.id}:sources`} label="Sources">
          <ul className="exploration-sources">{data.sources.map(source => <li key={source.url}>
            <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
          </li>)}</ul>
        </DiscoveryDetails>
      </>}
      {error && <p role="alert">{error}</p>}
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
