import { Navigate, useParams } from 'react-router-dom';
import { Page } from '../design/Page';
import { localLearnerId } from '../data/learner';
import { buildCoursePath } from '../logic/coursePath';
import { useToday } from './useToday';
import { TemporaryCell } from './TemporaryCell';
import { LessonPlayer } from './LessonPlayer';

export function Cell() {
  const { id } = useParams();
  const { content, progress, model, error } = useToday();
  const cell = content?.cells.find(row => row.id === id);
  const lesson = content?.lessons.find(row => row.cellId === id && !row.placeholder);
  if (content && !cell) return <Navigate to="/learn" replace />;
  if (cell && !lesson) return <TemporaryCell />;
  if (cell && lesson && content && progress && model) {
    const path = buildCoursePath(content, progress, undefined, cell.unitId);
    if (path.cells.find(row => row.id === id)?.state === 'locked') return <TemporaryCell />;
    return <LessonPlayer key={lesson.id} lesson={lesson} content={content} reduceMotion={model.reduceMotion} completedBefore={progress.completions.some(row => row.learnerId === localLearnerId && row.cellId === cell.id)} />;
  }
  return <Page skipLabel="Cell"><main id="main-content" tabIndex={-1} aria-busy={!error}>{error && <p role="alert">{error}</p>}</main></Page>;
}
