import 'fake-indexeddb/auto';
import { Dexie } from 'dexie';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AstronDb } from './db';
import { sampleContent } from './contentFixtures';
import { lightStar, openDay, readProgress, exportProgress } from './services';
import { finishLesson, saveLessonAnswer } from './lessonServices';
import { completePathCell } from './pathServices';
import type { HunchChoice, StarTint } from './types';

const content = sampleContent();
const now = new Date('2026-10-18T12:00:00');
const later = new Date('2026-10-19T12:00:00');
let database: AstronDb;
let number = 0;
beforeEach(() => { database = new AstronDb(`astron-tint-${number++}`); });
afterEach(async () => { vi.restoreAllMocks(); await database.delete(); });
async function ready() {
  for (const cell of content.cells.slice(0, 2)) await completePathCell(database, content, 'one', cell.id, now);
  for (const id of ['ex-03-order', 'ex-03-choice']) await saveLessonAnswer(database, content, 'one', 'lesson-03', id, true, now);
}
const finish = (hunch: HunchChoice, date = now) => finishLesson(database, content, 'one', 'lesson-03', [], date, hunch);

describe('Star tint persistence and lesson completion', () => {
  it.each(['blue', 'orange', 'red', 'gold'] as const)('saves and exports a %s tint after reopening', async tint => {
    await openDay(database, 'one', now);
    await lightStar(database, content, 'one', 'star-clue-03', 'lesson', now, tint);
    database.close(); await database.open();
    expect((await readProgress(database)).litStars).toEqual([{ learnerId: 'one', starId: 'star-clue-03', litOn: now.toISOString(), how: 'lesson', tint }]);
    expect(JSON.parse(await exportProgress(database)).litStars[0].tint).toBe(tint);
  });
  it.each([['blue', 'blue'], ['orange', 'orange'], ['red', 'red'], ['skipped', 'gold']] as const)('finishes a %s hunch with one %s clue', async (hunch, tint) => {
    await ready();
    await finish(hunch);
    expect(await database.litStars.toArray()).toEqual([{ learnerId: 'one', starId: 'star-clue-03', litOn: now.toISOString(), how: 'lesson', tint }]);
  });
  it('preserves the first tint, source and date across simultaneous repeats and later practice', async () => {
    await ready(); await finish('orange');
    const before = await readProgress(database);
    await Promise.all([finish('blue', later), finish('skipped', later), finish('red', later)]);
    expect(await readProgress(database)).toEqual(before);
  });
  it('adds a clue on replay for a learner who finished before this feature', async () => {
    await ready();
    await database.completions.add({ learnerId: 'one', cellId: 'star-lesson', completedOn: now.toISOString(), correctAnswers: 2, xpEarned: 0 });
    const before = await readProgress(database);
    expect((await finish('red', later)).learnQuestEarned).toBe(false);
    const after = await readProgress(database);
    expect(after.litStars).toHaveLength(1);
    expect(after.litStars[0]).toMatchObject({ tint: 'red', how: 'lesson' });
    expect({ ...after, litStars: [] }).toEqual(before);
  });
  it('does not light the clue for an unfinished lesson', async () => {
    for (const cell of content.cells.slice(0, 2)) await completePathCell(database, content, 'one', cell.id, now);
    await expect(finish('blue')).rejects.toThrow('Continue through');
    expect(await database.litStars.count()).toBe(0);
  });
  it('rolls back completion and the Learn reward when lighting fails', async () => {
    await ready();
    const before = await readProgress(database);
    vi.spyOn(database.litStars, 'add').mockRejectedValueOnce(new Error('Storage full'));
    await expect(finish('blue', later)).rejects.toThrow('Storage full');
    expect(await readProgress(database)).toEqual(before);
  });
  it('rejects invalid tints before writing', async () => {
    await openDay(database, 'one', now);
    expect(() => lightStar(database, content, 'one', 'star-clue-03', 'lesson', now, 'purple' as StarTint)).toThrow('Unknown star tint');
    expect(await database.litStars.count()).toBe(0);
  });
});

describe('Version-one progress upgrade', () => {
  it('keeps every saved table and untinted star, then allows tinted stars', async () => {
    const old = new Dexie(database.name);
    old.version(1).stores({
      learners: 'id', learnerInterests: '[learnerId+interestId], learnerId',
      activityDays: '[learnerId+dayDate], learnerId', questDone: '[learnerId+dayDate+questId], learnerId, [learnerId+dayDate]',
      completions: '[learnerId+cellId], learnerId', answers: '[learnerId+exerciseId], learnerId',
      litStars: '[learnerId+starId], learnerId', articleReads: '[learnerId+articleId], learnerId',
    });
    const rows: Record<string, object> = {
      learners: { id: 'one', displayName: '', dailyGoal: 2, language: 'en', reduceMotion: true, freezesLeft: 1 },
      learnerInterests: { learnerId: 'one', interestId: 'myths' },
      activityDays: { learnerId: 'one', dayDate: '2026-10-18', freezeUsed: false, dailyGoal: 2 },
      questDone: { learnerId: 'one', dayDate: '2026-10-18', questId: 'daily-learn', doneOn: now.toISOString(), xpEarned: 20 },
      completions: { learnerId: 'one', cellId: 'orion-lesson', completedOn: now.toISOString(), correctAnswers: 1, xpEarned: 0 },
      answers: { learnerId: 'one', exerciseId: 'orion-choice', answeredOn: now.toISOString(), correct: true, attempts: 1 },
      litStars: { learnerId: 'one', starId: 'betelgeuse', litOn: now.toISOString(), how: 'tale' },
      articleReads: { learnerId: 'one', articleId: 'looking-slowly', readOn: now.toISOString() },
    };
    try { for (const [table, row] of Object.entries(rows)) await old.table(table).add(row); }
    finally { old.close(); }
    await database.open();
    expect(database.verno).toBe(2);
    expect(await readProgress(database)).toEqual(Object.fromEntries(Object.entries(rows).map(([table, row]) => [table, [row]])));
    await lightStar(database, content, 'one', 'star-clue-03', 'lesson', now, 'blue');
    expect(await database.litStars.count()).toBe(2);
    expect((await database.litStars.get(['one', 'betelgeuse']))).not.toHaveProperty('tint');
  });
});
