import 'fake-indexeddb/auto';
import { Dexie } from 'dexie';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AstronDb } from './db';
import { sampleContent } from './contentFixtures';
import { defaultLearner } from './learner';
import { advanceTaleVisit, answerBeltActivity, collectTaleStar, finishWelcome, previousTaleChapter, startTaleVisit } from './taleServices';
import { eraseProgress, readProgress, setReduceMotion } from './services';
import { needsWelcome } from '../logic/taleJourney';
import { totalXp } from '../logic/xp';
import { finishLesson, saveLessonAnswer, submitLessonExam } from './lessonServices';
import { correctSelection } from '../logic/lessonPlayer';

const content = sampleContent();
const now = new Date('2026-10-25T12:00:00');
const learnerId = 'one'; const taleId = 'orion-shoulder';
let database: AstronDb; let sequence = 0;
beforeEach(() => { database = new AstronDb(`astron-tale-${sequence++}`); });
afterEach(async () => { vi.restoreAllMocks(); await database.delete(); });
async function readToStar() {
  await startTaleVisit(database, content, learnerId, taleId, now, { welcome: true });
  for (let chapter = 0; chapter < 4; chapter++) await advanceTaleVisit(database, content, learnerId, taleId);
}
async function xp() {
  const progress = await readProgress(database);
  return totalXp(progress.completions, progress.questDone, progress.answers, content.exercises);
}

describe('The shared Orion journey', () => {
  it('starts without awarding a star, cell or quest and resumes the saved chapter', async () => {
    await startTaleVisit(database, content, learnerId, taleId, now, { welcome: true });
    await advanceTaleVisit(database, content, learnerId, taleId);
    database.close(); await database.open();
    const visit = await startTaleVisit(database, content, learnerId, taleId, now, { welcome: true });
    expect(visit).toMatchObject({ chapter: 2, stage: 'story', readThrough: false });
    expect(await database.completions.count()).toBe(0);
    expect(await database.questDone.count()).toBe(0);
    expect(await database.litStars.count()).toBe(0);
  });
  it('requires reading before collection and collection before the activity', async () => {
    await startTaleVisit(database, content, learnerId, taleId, now);
    await expect(collectTaleStar(database, content, learnerId, taleId, now)).rejects.toThrow('Read the story');
    await expect(answerBeltActivity(database, content, learnerId, taleId, 'show-me')).rejects.toThrow('Light your star');
    expect(await xp()).toBe(0);
  });
  it('saves the tale cell and star once without completing any prerequisites', async () => {
    await readToStar();
    await Promise.all([collectTaleStar(database, content, learnerId, taleId, now), collectTaleStar(database, content, learnerId, taleId, now)]);
    const progress = await readProgress(database);
    expect(progress.completions.map(row => row.cellId)).toEqual(['orion-tale']);
    expect(progress.litStars).toMatchObject([{ starId: 'betelgeuse', how: 'tale' }]);
    expect(progress.questDone.map(row => row.questId).sort()).toEqual(['daily-learn', 'daily-story']);
    expect(await xp()).toBe(35);
    expect(progress.learners[0].taleVisit?.stage).toBe('activity');
    expect(needsWelcome(progress, learnerId)).toBe(true);
  });
  it('rolls back completion and rewards when the star save fails', async () => {
    await readToStar();
    vi.spyOn(database.litStars, 'add').mockRejectedValueOnce(new Error('Storage full'));
    await expect(collectTaleStar(database, content, learnerId, taleId, now)).rejects.toThrow('Storage full');
    expect(await database.completions.count()).toBe(0);
    expect(await database.questDone.count()).toBe(0);
    expect((await database.learners.get(learnerId))?.taleVisit?.stage).toBe('star');
  });
  it('a missed group keeps the earned star and does not add attempt XP or advance', async () => {
    await readToStar(); await collectTaleStar(database, content, learnerId, taleId, now);
    expect(await answerBeltActivity(database, content, learnerId, taleId, 'upper')).toBe(false);
    expect(await answerBeltActivity(database, content, learnerId, taleId, 'lower')).toBe(false);
    await expect(advanceTaleVisit(database, content, learnerId, taleId)).rejects.toThrow('Finish this part');
    expect(await database.litStars.count()).toBe(1);
    expect(await database.answers.count()).toBe(0);
    expect(await xp()).toBe(35);
  });
  it.each(['belt', 'show-me'] as const)('can finish with %s and preserves the result on reload', async choice => {
    await readToStar(); await collectTaleStar(database, content, learnerId, taleId, now);
    expect(await answerBeltActivity(database, content, learnerId, taleId, choice)).toBe(true);
    database.close(); await database.open();
    expect((await database.learners.get(learnerId))?.taleVisit?.beltOutcome).toBe(choice === 'belt' ? 'independent' : 'assisted');
    await advanceTaleVisit(database, content, learnerId, taleId);
    expect((await database.learners.get(learnerId))?.taleVisit?.stage).toBe('sky');
    expect(await xp()).toBe(35);
  });
  it('does not rewrite assisted learning as independent on a repeated check', async () => {
    await readToStar(); await collectTaleStar(database, content, learnerId, taleId, now);
    await answerBeltActivity(database, content, learnerId, taleId, 'show-me');
    await answerBeltActivity(database, content, learnerId, taleId, 'belt');
    expect((await database.learners.get(learnerId))?.taleVisit?.beltOutcome).toBe('assisted');
  });
  it('finishes preferences after the experience and preserves freezes and motion choices', async () => {
    await readToStar(); await collectTaleStar(database, content, learnerId, taleId, now);
    await database.learners.update(learnerId, { freezesLeft: 0 });
    await answerBeltActivity(database, content, learnerId, taleId, 'show-me');
    await advanceTaleVisit(database, content, learnerId, taleId);
    await advanceTaleVisit(database, content, learnerId, taleId);
    await finishWelcome(database, content, learnerId, ['stars', 'stars'], 3, true, now);
    const progress = await readProgress(database);
    expect(progress.learners[0]).toMatchObject({ dailyGoal: 3, freezesLeft: 0, reduceMotion: true, welcome: { completedOn: now.toISOString() } });
    expect(progress.learnerInterests).toEqual([{ learnerId, interestId: 'stars' }]);
    expect(needsWelcome(progress, learnerId)).toBe(false);
    await finishWelcome(database, content, learnerId, ['myths'], 1, false, now);
    expect((await database.learners.get(learnerId))?.dailyGoal).toBe(3);
  });
  it('does not finish welcome early', async () => {
    await startTaleVisit(database, content, learnerId, taleId, now, { welcome: true });
    await expect(finishWelcome(database, content, learnerId, [], 2, false, now)).rejects.toThrow('Finish the Orion experience');
  });
  it('revisits through the same record without duplicating stars or rewards', async () => {
    await readToStar(); await collectTaleStar(database, content, learnerId, taleId, now);
    await startTaleVisit(database, content, learnerId, taleId, now, { restart: true });
    for (let index = 0; index < 4; index++) await advanceTaleVisit(database, content, learnerId, taleId);
    await collectTaleStar(database, content, learnerId, taleId, now);
    expect(await database.litStars.count()).toBe(1); expect(await database.completions.count()).toBe(1); expect(await xp()).toBe(35);
  });
  it('continues from Orion into the real lesson without placeholder progress or duplicate Learn XP', async () => {
    await readToStar(); await collectTaleStar(database, content, learnerId, taleId, now);
    await answerBeltActivity(database, content, learnerId, taleId, 'belt');
    await advanceTaleVisit(database, content, learnerId, taleId);
    await advanceTaleVisit(database, content, learnerId, taleId);
    await finishWelcome(database, content, learnerId, [], 2, false, now);
    const scale=content.lessons.find(l=>l.id==='patterns')!;
    const answers=Object.fromEntries(scale.cards.flatMap(c=>c.kind==='exercise'?[[c.exerciseId,correctSelection(content.exercises.find(e=>e.id===c.exerciseId)!)]]:[]));
    await submitLessonExam(database,content,learnerId,scale.id,answers,now);
    for (const exercise of ['ex-03-order', 'ex-03-choice']) await saveLessonAnswer(database, content, learnerId, 'lesson-03', exercise, true, now);
    await finishLesson(database, content, learnerId, 'lesson-03', [], now, 'blue');
    const saved = await readProgress(database);
    expect(saved.completions.map(row => row.cellId).sort()).toEqual(['orion-lesson','orion-tale', 'star-lesson']);
    expect(saved.litStars.map(row => row.starId).sort()).toEqual(['betelgeuse', 'star-clue-03']);
    expect(saved.questDone).toHaveLength(2);
    expect(await xp()).toBe(55);
  });
  it('keeps motion changes when moving backwards and forwards', async () => {
    await startTaleVisit(database, content, learnerId, taleId, now);
    await advanceTaleVisit(database, content, learnerId, taleId);
    await setReduceMotion(database, learnerId, true);
    await previousTaleChapter(database, learnerId, taleId);
    expect((await database.learners.get(learnerId))?.taleVisit?.chapter).toBe(1);
    expect((await database.learners.get(learnerId))?.reduceMotion).toBe(true);
  });
  it('erases the new checkpoints with the existing progress-erasure service', async () => {
    await readToStar(); await collectTaleStar(database, content, learnerId, taleId, now);
    await eraseProgress(database);
    expect(await database.learners.count()).toBe(0); expect(await database.litStars.count()).toBe(0);
    expect(needsWelcome(await readProgress(database), learnerId)).toBe(true);
  });
});

describe('Existing device migration', () => {
  it('opens a version-two database without altering earned progress or forcing onboarding', async () => {
    const old = new Dexie(database.name);
    old.version(2).stores({ learners: 'id', learnerInterests: '[learnerId+interestId], learnerId', activityDays: '[learnerId+dayDate], learnerId', questDone: '[learnerId+dayDate+questId], learnerId', completions: '[learnerId+cellId], learnerId', answers: '[learnerId+exerciseId], learnerId', litStars: '[learnerId+starId], learnerId', articleReads: '[learnerId+articleId], learnerId' });
    await old.table('learners').add({ ...defaultLearner(learnerId), dailyGoal: 3, reduceMotion: true, freezesLeft: 0 });
    await old.table('litStars').add({ learnerId, starId: 'star-clue-03', litOn: now.toISOString(), how: 'lesson', tint: 'red' });
    old.close();
    await database.open();
    const progress = await readProgress(database);
    expect(database.verno).toBe(3);
    expect(progress.learners[0]).toMatchObject({ dailyGoal: 3, reduceMotion: true, freezesLeft: 0 });
    expect(progress.litStars[0]).toMatchObject({ tint: 'red', how: 'lesson' });
    expect(progress.learners[0].welcome).toBeUndefined();
    expect(needsWelcome(progress, learnerId)).toBe(false);
  });
});
