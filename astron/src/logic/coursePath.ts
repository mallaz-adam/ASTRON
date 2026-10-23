import type { Content, Progress } from '../data/types';
import { localLearnerId } from '../data/learner';
import { glauxLine } from './glauxVoice';

export function buildCoursePath(content: Content, progress: Pick<Progress, 'completions'>, learnerId = localLearnerId, unitId?: string) {
  const unit = unitId ? content.units.find(row => row.id === unitId) : [...content.units].sort((a, b) => a.orderNo - b.orderNo)[0];
  if (!unit) throw new Error('Course unit is missing.');
  const ordered = content.cells.filter(cell => cell.unitId === unit.id).sort((a, b) => a.positionNo - b.positionNo);
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
