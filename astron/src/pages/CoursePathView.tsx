import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../design/Page';
import { GlauxArt } from '../design/InlineArt';
import type { LearningRoadmap, RoadmapState } from '../logic/learningRoadmap';
import { useDesktopLayout } from '../hooks/useDesktopLayout';
import { TodayTabs } from './TodayTabs';
import './Today.css';
import './CoursePath.css';

const stateLabels: Record<RoadmapState, string> = {
  available: 'Available', completed: 'Completed', locked: 'Locked', preparing: 'Still being prepared',
};

function StatusIcon({ state }: { state: RoadmapState }) {
  return <svg className="roadmap-icon" viewBox="0 0 24 24" aria-hidden="true">
    {state === 'completed' ? <path d="m5 12 4 4L19 6" />
      : state === 'locked' ? <><rect x="5" y="10" width="14" height="11" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>
      : state === 'preparing' ? <><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h4" /></>
      : <path d="m9 5 7 7-7 7" />}
  </svg>;
}

export function CoursePathView({ model, reduceMotion, selectedChapterId, onSelectChapter }: {
  model: LearningRoadmap; reduceMotion: boolean; selectedChapterId?: string; onSelectChapter?: (id: string) => void;
}) {
  const desktop = useDesktopLayout();
  const [localSelection, setLocalSelection] = useState<string>();
  const selected = model.chapters.find(chapter => chapter.id === (selectedChapterId ?? localSelection))
    ?? model.chapters.find(chapter => chapter.id === model.currentChapterId) ?? model.chapters[0];
  const heading = useRef<HTMLHeadingElement>(null);
  const previousId = useRef(selected?.id);
  useEffect(() => {
    if (previousId.current !== selected?.id) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: 'start' });
      previousId.current = selected?.id;
    }
  }, [selected?.id]);

  return <Page className="course-page" reduceMotion={reduceMotion} skipLabel="Skip to learning path">
    <main id="main-content" className="course-main" tabIndex={-1}>
      {desktop && <TodayTabs />}
      <header className="roadmap-heading">
        <p className="course-label">Learn</p>
        <h1>Your learning path</h1>
        <p>Begin with familiar worlds, then explore the wider universe.</p>
      </header>
      {model.next ? <section className="roadmap-next" aria-labelledby="next-lesson-title">
        <div><p className="course-label">{model.next.started ? 'Continue learning' : 'Begin here'}</p>
          <h2 id="next-lesson-title">{model.next.title}</h2><p>{model.next.chapterTitle}</p></div>
        <Link className="atlas-button atlas-button--primary course-action" to={model.next.to}>{model.next.started ? 'CONTINUE' : 'BEGIN'}</Link>
      </section> : <div className="roadmap-waiting" role="status">
        <GlauxArt mood="thinking" /><p>{model.chapters.every(chapter => chapter.state === 'completed')
          ? 'You have completed these chapters. Revisit a lesson whenever you like.'
          : 'You have finished the available lessons. More units and the chapter evaluation are being prepared.'}</p>
      </div>}
      <div className="roadmap-layout">
        <section className="roadmap-chapters" aria-labelledby="chapters-title">
          <h2 id="chapters-title">Chapters</h2>
          <p className="roadmap-help">Choose a chapter to see its units and your progress.</p>
          <ol className="chapter-list">{model.chapters.map(chapter => <li key={chapter.id}>
            <button type="button" className={`chapter-card chapter-card--${chapter.state}`}
              aria-expanded={chapter.id === selected?.id} aria-controls="chapter-overview"
              onClick={() => onSelectChapter ? onSelectChapter(chapter.id) : setLocalSelection(chapter.id)}>
              <span className="course-label">Chapter {chapter.orderNo}</span>
              <span className="chapter-card-title">{chapter.title}</span>
              <span className="roadmap-state"><StatusIcon state={chapter.state} />{stateLabels[chapter.state]}</span>
              <span>{chapter.countText}</span>
              <span className="chapter-card-action">{chapter.id === selected?.id ? 'Viewing units' : 'View units'} <span aria-hidden="true">→</span></span>
            </button>
          </li>)}</ol>
          <p className="roadmap-help">Complete each chapter’s units and its ten-question evaluation to unlock the next chapter.</p>
          <p className="roadmap-help">Greek stories are also available in Stories.</p>
        </section>
        {selected && <section id="chapter-overview" className="chapter-overview" aria-labelledby="chapter-title">
          <header className="chapter-overview-heading">
            <p className="course-label">Chapter {selected.orderNo} · {stateLabels[selected.state]}</p>
            <h2 id="chapter-title" ref={heading} tabIndex={-1}>{selected.title}</h2>
            <p>{selected.summary}</p>
            <div className="chapter-progress"><label htmlFor="chapter-progress">{selected.countText}</label>
              <progress id="chapter-progress" aria-label={`${selected.title}: ${selected.countText}`} value={selected.doneCount} max={Math.max(1, selected.totalCount)} /></div>
            <p className="roadmap-help">{selected.readinessText}. Available lessons open in order. Completed lessons can be revisited.</p>
            {!selected.unlocked && selected.state !== 'completed' && <p className="chapter-lock-note"><StatusIcon state="locked" />{selected.lockReason}</p>}
          </header>
          <ol className="roadmap-units">{selected.cells.map(cell => {
            const body = <><span className="unit-marker" aria-hidden="true">{cell.state === 'completed' ? '✓' : cell.positionNo}</span>
              <span className="roadmap-unit-copy"><span className="course-label">{cell.kind === 'tale' ? 'Story' : selected.id === 'our-place' ? 'Unit' : 'Lesson'} {cell.positionNo}</span>
                <span className="roadmap-unit-title">{cell.title}</span>
                <span className="roadmap-state"><StatusIcon state={cell.state} />{cell.status}{cell.to && cell.state === 'completed' ? ' · Review' : ''}</span>
                {cell.ready && <span className="roadmap-unit-time">{cell.minutes} min</span>}
              </span>{cell.to && <span className="unit-open-arrow" aria-hidden="true">→</span>}</>;
            return <li key={cell.id} className={`roadmap-unit roadmap-unit--${cell.state}`}>
              {cell.to ? <Link className="roadmap-unit-content" to={cell.to}>{body}</Link> : <div className="roadmap-unit-content">{body}</div>}
            </li>;
          })}</ol>
          <section className="chapter-evaluation" aria-labelledby="chapter-evaluation-title">
            <p className="course-label">End of chapter · 10 questions</p>
            <h3 id="chapter-evaluation-title">Chapter evaluation</h3>
            <p className="roadmap-state"><StatusIcon state={selected.evaluation.state} />{selected.evaluation.status}</p>
            <p>{selected.evaluation.reason}</p>
            <p>Completing and submitting the evaluation unlocks the next chapter. There is no minimum score.</p>
            {selected.evaluation.to && <Link className="atlas-button atlas-button--secondary course-action" to={selected.evaluation.to}>{selected.evaluation.state === 'completed' ? 'REVIEW EVALUATION' : 'OPEN EVALUATION'}</Link>}
          </section>
        </section>}
      </div>
      {!desktop && <TodayTabs />}
    </main>
  </Page>;
}
