import type { AstronDb } from './db';
import type { Content } from './types';
import { completeCell, lightStar } from './learningServices';
import { readProgress } from './progressServices';
import { buildCoursePath } from '../logic/coursePath';

// Recheck the saved prerequisites in the same transaction as the completion.
export function completePathCell(database: AstronDb, content: Content, learnerId: string, cellId: string, now: Date) {
  return database.transaction('rw', database.tables, async () => {
    const cell = content.cells.find(row => row.id === cellId);
    if (!cell) throw new Error(`Unknown cell: ${cellId}`);
    const model = buildCoursePath(content, await readProgress(database), learnerId, cell.unitId);
    if (model.cells.find(row => row.id === cellId)?.state === 'locked') throw new Error('Finish the cell before it to open this one.');
    await completeCell(database, content, learnerId, cellId, now);
    if (cell.kind === 'tale') {
      const tale = content.tales.find(row => row.id === cell.taleId);
      if (tale) await lightStar(database, content, learnerId, tale.starId, 'tale', now);
    }
  });
}
