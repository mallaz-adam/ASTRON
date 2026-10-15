import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AstronDb } from './db';
import { sampleContent } from './contentFixtures';
import { completePathCell } from './pathServices';
import { readProgress } from './services';
import { buildCoursePath } from '../logic/coursePath';
import { totalXp } from '../logic/xp';

let database: AstronDb;
let number = 0;
const content = sampleContent();
const learner = 'one';
const now = new Date('2026-10-15T12:00:00');
beforeEach(() => { database = new AstronDb(`astron-path-test-${number++}`); });
afterEach(async () => { await database.delete(); });

describe('Temporary path completion', () => {
  it('rejects a locked cell before writing any progress', async () => {
    await expect(completePathCell(database, content, learner, content.cells[2].id, now)).rejects.toThrow('Finish the cell before it');
    expect((await Promise.all(database.tables.map(table => table.count())))).toEqual(Array(8).fill(0));
  });
  it('marks a lesson done, grants Learn, and opens the next cell', async () => {
    await completePathCell(database, content, learner, content.cells[0].id, now);
    const saved = await readProgress(database);
    expect(buildCoursePath(content, saved, learner).current?.positionNo).toBe(2);
    expect(saved.questDone.map(row => row.questId)).toEqual(['daily-learn']);
    expect(totalXp(saved.completions, saved.questDone, saved.answers, content.exercises)).toBe(20);
  });
  it('finishes a tale, counts Discover and lights its one star without extra repeat XP', async () => {
    for (const cell of content.cells.slice(0, 4)) await completePathCell(database, content, learner, cell.id, now);
    await completePathCell(database, content, learner, content.cells[3].id, now);
    const saved = await readProgress(database);
    expect(saved.completions).toHaveLength(4);
    expect(saved.questDone.map(row => row.questId).sort()).toEqual(['daily-learn', 'daily-story']);
    expect(saved.litStars).toMatchObject([{ starId: 'betelgeuse', how: 'tale' }]);
    expect(buildCoursePath(content, saved, learner).current?.positionNo).toBe(5);
    expect(totalXp(saved.completions, saved.questDone, saved.answers, content.exercises)).toBe(35);
  });
  it('links the second tale to Alcyone and keeps the sample content complete', async () => {
    for (const cell of content.cells.slice(0, 7)) await completePathCell(database, content, learner, cell.id, now);
    expect((await database.litStars.toArray()).map(star => star.starId).sort()).toEqual(['alcyone', 'betelgeuse']);
    const tale = content.tales.find(row => row.id === content.cells[6].taleId);
    expect(content.chapters.filter(chapter => chapter.taleId === tale?.id)).toHaveLength(1);
  });
  it('keeps completion and the next cell after reopening storage', async () => {
    await Promise.all(Array.from({ length: 3 }, () => completePathCell(database, content, learner, content.cells[0].id, now)));
    database.close(); await database.open();
    expect(await database.completions.count()).toBe(1);
    expect(buildCoursePath(content, await readProgress(database), learner).current?.positionNo).toBe(2);
  });
});
