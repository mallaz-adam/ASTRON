import { Page } from '../design/Page';
import { buildCoursePath } from '../logic/coursePath';
import { useToday } from './useToday';
import { CoursePathView } from './CoursePathView';
import { Link, useSearchParams } from 'react-router-dom';

export function CoursePath() {
  const [search] = useSearchParams();
  const { model, content, progress, error } = useToday();
  const chapter = content?.units.find(unit => unit.id === search.get('chapter'));
  if (model && content && progress) return <CoursePathView model={buildCoursePath(content, progress, undefined, chapter?.id, true)} reduceMotion={model.reduceMotion}
    chapterNavigation={<nav className="course-chapters" aria-label="Available chapters">{[...content.units].sort((a, b) => a.orderNo - b.orderNo).map(unit => <Link key={unit.id} to={unit.id === 'our-place' ? '/learn' : `/learn?chapter=${unit.id}`} aria-current={unit.id === (chapter?.id ?? 'our-place') ? 'page' : undefined}>{unit.title}</Link>)}</nav>} />;
  return <Page className="course-page" skipLabel="Course path"><main id="main-content" tabIndex={-1} aria-busy={!error}>
    {error && <p role="alert">{error}</p>}
  </main></Page>;
}
