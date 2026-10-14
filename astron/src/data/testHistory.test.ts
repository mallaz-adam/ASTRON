import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AstronDb } from './db';
import { sampleContent } from './contentFixtures';
import { createTestHistory, eraseProgress, openDay, readProgress, setReduceMotion } from './services';
import { atLocalNoon } from '../logic/dates';
import { buildSunModel } from '../logic/sun';
import { localLearnerId } from './learner';

let database: AstronDb;
let number = 0;
const now = atLocalNoon('2026-10-14');
const content = sampleContent();
beforeEach(() => { database = new AstronDb(`astron-history-test-${number++}`); });
afterEach(async () => { await database.delete(); });

describe('Developer test history', () => {
  it.each([0, 5, 13, 30, 100])('creates exactly %s kept days ending yesterday', async count => {
    await createTestHistory(database, content, localLearnerId, count, now);
    const progress = await readProgress(database);
    const sun = buildSunModel(progress, content, now);
    expect(sun.streak).toBe(count);
    expect(sun.longest).toBe(count);
    expect(sun.rays[0].state).toBe('notYet');
    expect(progress.activityDays).toHaveLength(count + 1);
    expect(progress.questDone).toHaveLength(count * 2);
    expect(progress.activityDays.every(day => !day.freezeUsed)).toBe(true);
  });
  it('replaces a previous fixture, including zero, without spending or refilling freezes', async () => {
    await openDay(database, localLearnerId, now);
    await database.learners.update(localLearnerId, { freezesLeft: 0, dailyGoal: 3 });
    await setReduceMotion(database, localLearnerId, true);
    await createTestHistory(database, content, localLearnerId, 100, now);
    await createTestHistory(database, content, localLearnerId, 5, now);
    expect(buildSunModel(await readProgress(database), content, now).streak).toBe(5);
    await createTestHistory(database, content, localLearnerId, 0, now);
    expect(await database.questDone.count()).toBe(0);
    expect(await database.learners.get(localLearnerId)).toMatchObject({ freezesLeft: 0, reduceMotion: true, dailyGoal: 3 });
  });
  it('leaves other learners and non-history records alone', async () => {
    await createTestHistory(database, content, 'other', 13, now);
    await database.completions.add({ learnerId: localLearnerId, cellId: 'orion-lesson', completedOn: now.toISOString(), correctAnswers: 0, xpEarned: 0 });
    await createTestHistory(database, content, localLearnerId, 5, now);
    expect(buildSunModel(await readProgress(database), content, now, 'other').streak).toBe(13);
    expect(await database.completions.count()).toBe(1);
  });
  it('erases generated history with all progress', async () => {
    await createTestHistory(database, content, localLearnerId, 100, now);
    await eraseProgress(database);
    for (const table of database.tables) expect(await table.count()).toBe(0);
  });
  it('rejects fractional and negative counts before changing saved data', async () => {
    await createTestHistory(database, content, localLearnerId, 5, now);
    expect(() => createTestHistory(database, content, localLearnerId, -1, now)).toThrow();
    expect(() => createTestHistory(database, content, localLearnerId, 1.5, now)).toThrow();
    expect(buildSunModel(await readProgress(database), content, now).streak).toBe(5);
  });
});
