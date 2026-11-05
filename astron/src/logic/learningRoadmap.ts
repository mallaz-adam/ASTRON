import type { Content, Progress } from '../data/types';
import { localLearnerId } from '../data/learner';
import { buildCoursePath } from './coursePath';

export type RoadmapState = 'available' | 'completed' | 'locked' | 'preparing';

/** The normal Learn journey. The older per-chapter model also serves dev tools. */
export function buildLearningRoadmap(content: Content, progress: Pick<Progress, 'completions'>, learnerId = localLearnerId) {
  const done = new Set(progress.completions.filter(row => row.learnerId === learnerId).map(row => row.cellId));
  const authored = new Set(content.lessons.filter(lesson => !lesson.placeholder).map(lesson => lesson.cellId));
  for (const cell of content.cells) {
    if (cell.kind === 'tale' && content.tales.some(tale => tale.id === cell.taleId && tale.reader)) authored.add(cell.id);
  }
  let previousComplete = true;
  const chapters = [...content.units].sort((a, b) => a.orderNo - b.orderNo).map((chapter, index, ordered) => {
    const planned = content.cells.filter(cell => cell.unitId === chapter.id).sort((a, b) => a.positionNo - b.positionNo);
    const units = planned.filter(cell => cell.kind !== 'quiz');
    const quiz = planned.find(cell => cell.kind === 'quiz');
    // A placeholder completion cannot turn an unfinished evaluation into a real one.
    const allUnitsDone = units.length > 0 && units.every(cell => authored.has(cell.id) && done.has(cell.id));
    const complete = allUnitsDone && Boolean(quiz && authored.has(quiz.id) && done.has(quiz.id));
    const unlocked = previousComplete;
    const path = buildCoursePath(content, progress, learnerId, chapter.id, true);
    const readyCount = units.filter(cell => authored.has(cell.id)).length;
    const doneCount = units.filter(cell => done.has(cell.id)).length;
    const state: RoadmapState = complete ? 'completed' : !unlocked ? 'locked' : readyCount === 0 ? 'preparing' : 'available';
    const previous = ordered[index - 1];
    const lockReason = previous ? `Complete the evaluation in ${previous.title} to unlock this chapter.` : '';
    const cells = units.map(cell => {
      const ready = authored.has(cell.id);
      const completed = done.has(cell.id);
      const available = unlocked && path.cells.find(row => row.id === cell.id)?.state === 'current';
      const cellState: RoadmapState = !ready ? 'preparing' : completed ? 'completed' : available ? 'available' : 'locked';
      return { ...cell, state: cellState, completed, ready,
        status: cellState === 'completed' ? 'Completed' : cellState === 'preparing' ? 'Still being prepared' : cellState === 'available' ? 'Ready to begin' : 'Locked',
        reason: cellState !== 'locked' ? '' : !unlocked ? lockReason : 'Finish the cell before it to open this one.',
        to: ready && (completed || available) ? `/cell/${cell.id}` : null,
      };
    });
    const evaluationState: RoadmapState = !quiz || !authored.has(quiz.id) ? 'preparing'
      : complete ? 'completed' : unlocked && allUnitsDone ? 'available' : 'locked';
    const evaluation = { state: evaluationState,
      to: quiz && (evaluationState === 'completed' || evaluationState === 'available') ? `/cell/${quiz.id}` : null,
      status: evaluationState === 'completed' ? 'Completed' : evaluationState === 'preparing' ? 'Still being prepared' : evaluationState === 'available' ? 'Ready to begin' : 'Locked',
      reason: evaluationState === 'preparing' ? 'The chapter and its ten-question evaluation are still being prepared.'
        : evaluationState === 'locked' ? !unlocked ? lockReason : 'Finish all the units in this chapter first.'
        : evaluationState === 'completed' ? 'You have completed this chapter. You can revisit its lessons.'
        : 'Bring together what you have learned. Complete and submit all ten questions to finish this chapter.',
    };
    previousComplete = unlocked && complete;
    return { ...chapter, state, unlocked, lockReason, cells, evaluation, doneCount, totalCount: units.length, readyCount,
      countText: `${doneCount} of ${units.length} ${chapter.id === 'our-place' ? 'units' : 'steps'} completed`,
      readinessText: `${readyCount} of ${units.length} ${chapter.id === 'our-place' ? 'units' : 'steps'} ready`,
    };
  });
  const currentChapter = chapters.find(chapter => chapter.unlocked && chapter.state !== 'completed');
  const next = currentChapter?.cells.find(cell => cell.state === 'available');
  const nextStep = next ? { title: next.title, to: next.to!, chapterTitle: currentChapter!.title, started: currentChapter!.doneCount > 0 }
    : currentChapter?.evaluation.state === 'available' ? { title: 'Chapter evaluation', to: currentChapter.evaluation.to!, chapterTitle: currentChapter.title, started: true } : null;
  return { chapters, currentChapterId: currentChapter?.id ?? chapters.at(-1)?.id, next: nextStep };
}

export type LearningRoadmap = ReturnType<typeof buildLearningRoadmap>;

/** Looking at a chapter never awards progress. Completed lessons stay reviewable. */
export function learningCellAccess(content: Content, progress: Pick<Progress, 'completions'>, learnerId: string, cellId: string) {
  const roadmap = buildLearningRoadmap(content, progress, learnerId);
  const cell = content.cells.find(row => row.id === cellId);
  const chapter = roadmap.chapters.find(row => row.id === cell?.unitId);
  if (!chapter || !cell) return { allowed: false, reason: 'This lesson is still being prepared.' };
  const row = cell.kind === 'quiz' ? chapter.evaluation : chapter.cells.find(row => row.id === cellId);
  return { allowed: Boolean(row?.to), reason: row?.state === 'preparing' ? 'This lesson is still being prepared.'
    : !chapter.unlocked ? chapter.lockReason : 'Finish the cell before it to open this one.' };
}
