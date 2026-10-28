import type { ExplorationLesson, ExplorationSection } from '../data/explorationLesson';
import type { Content, Progress } from '../data/types';
import { buildCoursePath } from './coursePath';

export type ReadingStep = {
  id: string;
  section: ExplorationSection;
  paragraphs: string[];
  explore: boolean;
};

// Keep the explanation intact, then give its picture/activity its own space.
export function readingSteps(data: Pick<ExplorationLesson, 'sections'>): ReadingStep[] {
  return data.sections.flatMap(section => {
    if (section.paragraphs.length < 2) {
      return [{ id: section.id, section, paragraphs: section.paragraphs, explore: true }];
    }
    return [
      { id: `${section.id}:read`, section, paragraphs: section.paragraphs.slice(0, -1), explore: false },
      { id: `${section.id}:explore`, section, paragraphs: section.paragraphs.slice(-1), explore: true },
    ];
  });
}

export function nextReadingDestination(content: Content, progress: Pick<Progress, 'completions'> | undefined, learnerId: string, cellId: string) {
  const cell = content.cells.find(item => item.id === cellId);
  // Wait for the real saved completion, rather than inventing an unlocked cell.
  if (!cell || !progress?.completions.some(item => item.learnerId === learnerId && item.cellId === cellId)) return null;
  const path = buildCoursePath(content, progress, learnerId, cell.unitId, true);
  const next = path.cells.find(item => item.positionNo > cell.positionNo && item.state !== 'locked');
  return next ? { to: `/cell/${next.id}`, title: next.title } : { to: '/learn', title: 'Back to the path' };
}
