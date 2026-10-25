import type { Content, Progress } from '../data/types';
import { localLearnerId } from '../data/learner';
import { glauxLine } from './glauxVoice';

export function buildCoursePath(content: Content, progress: Pick<Progress, 'completions'>, learnerId = localLearnerId, unitId?: string, testRelease = import.meta.env.PROD) {
  const unit = unitId ? content.units.find(row => row.id === unitId) : [...content.units].sort((a, b) => a.orderNo - b.orderNo)[0];
  if (!unit) throw new Error('Course unit is missing.');
  // The online test exposes authored lessons only. No placeholder is completed
  // or rewarded to bypass prerequisites; development keeps the full course.
  const playableIds = new Set(content.lessons.filter(lesson => !lesson.placeholder).map(lesson => lesson.cellId));
  for (const cell of content.cells) {
    if (cell.kind === 'tale' && content.tales.some(tale => tale.id === cell.taleId && tale.reader)) playableIds.add(cell.id);
  }
  const ordered = content.cells.filter(cell => cell.unitId === unit.id && (!testRelease || playableIds.has(cell.id))).sort((a, b) => a.positionNo - b.positionNo);
  const doneIds = new Set(progress.completions.filter(row => row.learnerId === learnerId).map(row => row.cellId));
  const currentId = ordered.find(cell => !doneIds.has(cell.id))?.id;
  const cells = ordered.map(cell => {
    const state: 'done' | 'current' | 'locked' = doneIds.has(cell.id) ? 'done' : cell.id === currentId ? 'current' : 'locked';
    const line = state === 'locked' ? 'Finish the cell before it to open this one.'
      : cell.kind === 'tale' ? `${cell.minutes} min · lights one star`
      : cell.kind === 'quiz' ? `${cell.minutes} min · a mix of everything` : `${cell.minutes} min`;
    return {
      ...cell, state, line, action: state === 'done' ? 'AGAIN' : 'BEGIN',
      label: `Cell ${cell.positionNo}, ${cell.title}, ${state} ${cell.kind}`,
    };
  });
  const doneCount = cells.filter(cell => cell.state === 'done').length;
  return {
    unit, cells, doneCount, current: cells.find(cell => cell.state === 'current') ?? null,
    countText: `${doneCount} of ${cells.length} done`, unitLabel: `UNIT ${unit.orderNo}`,
    glaux: glauxLine(content, doneCount === 0 ? 'pathBegin' : doneCount === cells.length ? 'pathComplete' : 'pathContinue'),
  };
}

export type CoursePathModel = ReturnType<typeof buildCoursePath>;
export type PathCell = CoursePathModel['cells'][number];
