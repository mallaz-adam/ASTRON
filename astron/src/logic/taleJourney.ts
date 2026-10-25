import type { Content, Progress } from '../data/types';
import { localLearnerId } from '../data/learner';

export const firstTaleId = 'orion-shoulder';

export function needsWelcome(progress: Progress, learnerId = localLearnerId) {
  const learner = progress.learners.find(row => row.id === learnerId);
  if (learner?.welcome?.completedOn) return false;
  if (learner?.welcome?.startedOn) return true;
  // Existing learners keep their normal home; a default learner/day created
  // by opening the app is not itself evidence of a previous learning visit.
  return ![...progress.completions, ...progress.questDone, ...progress.answers,
    ...progress.litStars, ...progress.articleReads].some(row => row.learnerId === learnerId);
}

export function readableTales(content: Content) {
  return content.tales.filter(tale => tale.reader && content.chapters.some(chapter => chapter.taleId === tale.id));
}

export type BeltChoice = 'upper' | 'belt' | 'lower';
export function isBeltChoice(value: unknown): value is BeltChoice {
  return value === 'upper' || value === 'belt' || value === 'lower';
}

export function evaluateBeltChoice(choice: BeltChoice) {
  return choice === 'belt';
}
