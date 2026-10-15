import { Page } from '../design/Page';
import { buildCoursePath } from '../logic/coursePath';
import { useToday } from './useToday';
import { CoursePathView } from './CoursePathView';

export function CoursePath() {
  const { model, content, progress, error } = useToday();
  if (model && content && progress) return <CoursePathView model={buildCoursePath(content, progress)} reduceMotion={model.reduceMotion} />;
  return <Page className="course-page" skipLabel="Course path"><main id="main-content" tabIndex={-1} aria-busy={!error}>
    {error && <p role="alert">{error}</p>}
  </main></Page>;
}
