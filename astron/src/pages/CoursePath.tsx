import { Page } from '../design/Page';
import { buildLearningRoadmap } from '../logic/learningRoadmap';
import { useToday } from './useToday';
import { CoursePathView } from './CoursePathView';
import { useSearchParams } from 'react-router-dom';

export function CoursePath() {
  const [search, setSearch] = useSearchParams();
  const { model, content, progress, error } = useToday();
  if (model && content && progress) return <CoursePathView
    model={buildLearningRoadmap(content, progress)} reduceMotion={model.reduceMotion}
    selectedChapterId={search.get('chapter') ?? undefined}
    onSelectChapter={id => setSearch({ chapter: id })} />;
  return <Page className="course-page" skipLabel="Course path"><main id="main-content" tabIndex={-1} aria-busy={!error}>
    {error && <p role="alert">{error}</p>}
  </main></Page>;
}
