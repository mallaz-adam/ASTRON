import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AstronDb } from './db';
import { sampleContent } from './contentFixtures';
import { changeDailyGoal, completeCell, completeQuest, eraseProgress, exportProgress, lightStar, markArticleRead, openDay, readProgress, recordAnswer, toRuleDays } from './services';
import { atLocalNoon } from '../logic/dates';
import { computeStreak } from '../logic/streak';
import { totalXp } from '../logic/xp';

let database: AstronDb;
let number = 0;
const content = sampleContent();
const learnerId = 'one';
const now = atLocalNoon('2026-10-13');
beforeEach(() => { database = new AstronDb(`astron-service-test-${number++}`); });
afterEach(async () => { vi.restoreAllMocks(); await database.delete(); });
async function xp() {
  const progress = await readProgress(database);
  return totalXp(progress.completions, progress.questDone, progress.answers, content.exercises);
}

describe('On-device progress services', () => {
  it('creates a learner with the Steady goal and no freezes', async () => {
    const learner = await openDay(database, learnerId, now);
    expect(learner.dailyGoal).toBe(2);
    expect(learner.freezesLeft).toBe(0);
  });
  it('saves only the first cell completion and first daily Learn reward', async () => {
    await completeCell(database, content, learnerId, 'orion-lesson', now, { xpEarned: 8 });
    await completeCell(database, content, learnerId, 'orion-lesson', now, { xpEarned: 100 });
    expect(await database.completions.count()).toBe(1);
    expect(await database.questDone.count()).toBe(1);
    expect(await xp()).toBe(28);
  });
  it('gives only daily quest XP by default', async () => {
    await completeCell(database, content, learnerId, 'orion-lesson', now);
    expect(await xp()).toBe(20);
  });
  it('counts a tale cell as both Learn and Discover', async () => {
    await completeCell(database, content, learnerId, 'orion-tale', now);
    expect((await database.questDone.toArray()).map(row => row.questId).sort()).toEqual(['daily-learn', 'daily-story']);
    expect(await xp()).toBe(35);
  });
  it('counts a quiz cell as Learn', async () => {
    await completeCell(database, content, learnerId, 'orion-quiz', now);
    expect(await xp()).toBe(20);
  });
  it('protects against simultaneous repeated clicks', async () => {
    await Promise.all(Array.from({ length: 8 }, () => completeCell(database, content, learnerId, 'orion-lesson', now)));
    expect(await database.completions.count()).toBe(1);
    expect(await xp()).toBe(20);
  });
  it('allows the daily Learn quest again tomorrow without another cell reward', async () => {
    await completeCell(database, content, learnerId, 'orion-lesson', now);
    await completeCell(database, content, learnerId, 'orion-lesson', atLocalNoon('2026-10-14'));
    expect(await database.completions.count()).toBe(1);
    expect(await xp()).toBe(40);
  });
  it('keeps first article reading but allows Read once on each day', async () => {
    await markArticleRead(database, content, learnerId, 'looking-slowly', now);
    await markArticleRead(database, content, learnerId, 'looking-slowly', now);
    await markArticleRead(database, content, learnerId, 'looking-slowly', atLocalNoon('2026-10-14'));
    expect(await database.articleReads.count()).toBe(1);
    expect(await database.questDone.count()).toBe(2);
    expect(await xp()).toBe(20);
  });
  it('awards the all-three bonus once, even after repeat presses', async () => {
    await completeCell(database, content, learnerId, 'orion-tale', now);
    await markArticleRead(database, content, learnerId, 'looking-slowly', now);
    await completeQuest(database, content, learnerId, 'read', now);
    expect(await xp()).toBe(55);
  });
  it('saves the latest exercise result and increases attempts', async () => {
    await recordAnswer(database, content, learnerId, 'orion-choice', false, now);
    await recordAnswer(database, content, learnerId, 'orion-choice', true, atLocalNoon('2026-10-14'));
    expect(await database.answers.count()).toBe(1);
    expect((await database.answers.toArray())[0]).toMatchObject({ correct: true, attempts: 2 });
    expect(await xp()).toBe(5);
  });
  it('lights a star only once and preserves its first source', async () => {
    await openDay(database, learnerId, now);
    expect(await lightStar(database, content, learnerId, 'betelgeuse', 'tale', now)).toBe(true);
    expect(await lightStar(database, content, learnerId, 'betelgeuse', 'sighting', now)).toBe(false);
    expect((await database.litStars.toArray())[0].how).toBe('tale');
  });
  it('changes today’s goal while preserving yesterday’s original goal', async () => {
    await changeDailyGoal(database, learnerId, 1, now);
    await completeCell(database, content, learnerId, 'orion-lesson', now);
    await changeDailyGoal(database, learnerId, 3, atLocalNoon('2026-10-14'));
    const progress = await readProgress(database);
    expect(progress.activityDays.find(day => day.dayDate === '2026-10-13')?.dailyGoal).toBe(1);
    expect(progress.activityDays.find(day => day.dayDate === '2026-10-14')?.dailyGoal).toBe(3);
    expect(computeStreak('2026-10-14', toRuleDays(progress), 3)).toBe(1);
  });
  it('keeps the streak next day, then breaks after an empty day passes', async () => {
    await completeCell(database, content, learnerId, 'orion-tale', now);
    await openDay(database, learnerId, atLocalNoon('2026-10-14'));
    expect(computeStreak('2026-10-14', toRuleDays(await readProgress(database)), 2)).toBe(1);
    await openDay(database, learnerId, atLocalNoon('2026-10-15'));
    expect(computeStreak('2026-10-15', toRuleDays(await readProgress(database)), 2)).toBe(0);
  });
  it('uses a freeze on a gap exactly once across repeated opens', async () => {
    await completeCell(database, content, learnerId, 'orion-tale', now);
    await database.learners.update(learnerId, { freezesLeft: 1 });
    const next = atLocalNoon('2026-10-15');
    await openDay(database, learnerId, next);
    await openDay(database, learnerId, next);
    const progress = await readProgress(database);
    expect(progress.learners[0].freezesLeft).toBe(0);
    expect(progress.activityDays.find(day => day.dayDate === '2026-10-14')?.freezeUsed).toBe(true);
    expect(computeStreak('2026-10-15', toRuleDays(progress), 2)).toBe(2);
  });
  it('reads saved progress after closing and reopening the database', async () => {
    await completeCell(database, content, learnerId, 'orion-lesson', now);
    database.close();
    await database.open();
    expect(await xp()).toBe(20);
  });
  it('exports only the eight progress tables and erases all eight', async () => {
    await completeCell(database, content, learnerId, 'orion-tale', now);
    await database.learnerInterests.add({ learnerId, interestId: 'myths' });
    await recordAnswer(database, content, learnerId, 'orion-choice', true, now);
    await lightStar(database, content, learnerId, 'betelgeuse', 'tale', now);
    await markArticleRead(database, content, learnerId, 'looking-slowly', now);
    const exported = JSON.parse(await exportProgress(database));
    expect(Object.keys(exported).sort()).toEqual(['learners', 'learnerInterests', 'activityDays', 'questDone', 'completions', 'answers', 'litStars', 'articleReads'].sort());
    await eraseProgress(database);
    expect((await Promise.all(database.tables.map(table => table.count())))).toEqual(Array(8).fill(0));
  });
  it('rolls back the completion if the quest save fails', async () => {
    vi.spyOn(database.questDone, 'add').mockRejectedValueOnce(new Error('Simulated storage failure'));
    await expect(completeCell(database, content, learnerId, 'orion-lesson', now)).rejects.toThrow('Simulated storage failure');
    expect(await database.completions.count()).toBe(0);
    expect(await database.activityDays.count()).toBe(0);
  });
  it('rejects unknown content before writing progress', () => {
    expect(() => completeCell(database, content, learnerId, 'missing', now)).toThrow('Unknown cell');
    expect(() => markArticleRead(database, content, learnerId, 'missing', now)).toThrow('Unknown article');
    expect(() => lightStar(database, content, learnerId, 'missing', 'tale', now)).toThrow('Unknown star');
  });
});
