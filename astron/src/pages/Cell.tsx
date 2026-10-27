import { Component, lazy, Suspense, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Page } from '../design/Page';
import { buildCoursePath } from '../logic/coursePath';
import { useToday } from './useToday';
import { TemporaryCell } from './TemporaryCell';
import { NotFound } from './NotFound';
import { localLearnerId } from '../data/learner';

const LessonPlayer = lazy(() => import('./LessonPlayer').then(module => ({ default: module.LessonPlayer })));
const ExplorationLesson = lazy(() => import('./ExplorationLesson').then(module => ({ default: module.ExplorationLesson })));
class LessonBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <Page skipLabel="Skip to lesson"><main id="main-content"><h1>The lesson could not open.</h1><button type="button" className="atlas-button atlas-button--primary" onClick={() => window.location.reload()}>Try again</button></main></Page>;
    return this.props.children;
  }
}

export function Cell() {
  const { id } = useParams();
  const { content, progress, model, error } = useToday();
  const cell = content?.cells.find(row => row.id === id);
  const lesson = content?.lessons.find(row => row.cellId === id && !row.placeholder);
  const readableTale = cell?.kind === 'tale' && content?.tales.find(row => row.id === cell.taleId && row.reader);
  // The same reader and completion are shared by welcome, Stories and the path.
  // Entering a tale directly never fabricates its earlier lesson completions.
  if (readableTale && progress) {
    const visit = progress.learners.find(row => row.id === localLearnerId)?.taleVisit;
    const resuming = visit?.taleId === readableTale.id && ['story', 'star', 'activity'].includes(visit.stage);
    const done = progress.completions.some(row => row.learnerId === localLearnerId && row.cellId === cell!.id);
    return <Navigate to={`/stories/${readableTale.id}${done && !resuming ? '?again' : ''}`} replace />;
  }
  if (import.meta.env.PROD && content && (!cell || !lesson)) return <NotFound />;
  if (content && !cell) return <Navigate to="/learn" replace />;
  if (cell && !lesson) return <TemporaryCell />;
  if (cell && lesson && content && progress && model) {
    const path = buildCoursePath(content, progress, undefined, cell.unitId, true);
    if (path.cells.find(row => row.id === id)?.state === 'locked') return <TemporaryCell />;
    return <LessonBoundary key={lesson.id}><Suspense fallback={<Page skipLabel="Skip to lesson"><main id="main-content" aria-busy="true"><h1>Opening the lesson…</h1></main></Page>}>
      {lesson.reader ? <ExplorationLesson lesson={lesson} content={content} reduceMotion={model.reduceMotion} /> : <LessonPlayer lesson={lesson} content={content} reduceMotion={model.reduceMotion} />}
    </Suspense></LessonBoundary>;
  }
  return <Page skipLabel="Cell"><main id="main-content" tabIndex={-1} aria-busy={!error}>{error && <p role="alert">{error}</p>}</main></Page>;
}
