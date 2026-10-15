import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AstronDb } from './db';
import { sampleContent } from './contentFixtures';
import { finishLesson, saveLessonAnswer } from './lessonServices';
import { completePathCell } from './pathServices';
import { readProgress } from './services';
import { totalXp } from '../logic/xp';
import { buildCoursePath } from '../logic/coursePath';

let database: AstronDb;
let number = 0;
const content = sampleContent();
const learner = 'one';
const lesson = 'lesson-03';
const order = 'ex-03-order';
const choice = 'ex-03-choice';
const now = new Date('2026-10-15T12:00:00');
beforeEach(() => { database = new AstronDb(`astron-lesson-test-${number++}`); });
afterEach(async () => { await database.delete(); });
async function prerequisites(date = now) {
  for (const cell of content.cells.slice(0, 2)) await completePathCell(database, content, learner, cell.id, date);
}
async function xp() {
  const p = await readProgress(database);
  return totalXp(p.completions, p.questDone, p.answers, content.exercises);
}
function answer(id: string, correct: boolean, date = now) { return saveLessonAnswer(database, content, learner, lesson, id, correct, date); }

describe('Lesson assessment and rewards', () => {
  it('requires cells one and two before saving a lesson answer', async () => {
    await expect(answer(order, true)).rejects.toThrow('Finish the cell before it');
    expect(await database.answers.count()).toBe(0);
  });
  it('finishes with two first-try answers, 40 total XP and cell four current', async () => {
    await prerequisites();
    await answer(order, true); await answer(choice, true);
    expect(await finishLesson(database, content, learner, lesson, [], now)).toEqual({ correctAnswers: 2, learnQuestEarned: false });
    expect(await xp()).toBe(40);
    const progress = await readProgress(database);
    expect(progress.completions.find(row => row.cellId === 'star-lesson')?.correctAnswers).toBe(2);
    expect(buildCoursePath(content, progress, learner).current?.positionNo).toBe(4);
    database.close(); await database.open();
    expect(await xp()).toBe(40);
  });
  it('grants Learn at the first lesson completion when it was not already done today', async () => {
    await prerequisites(new Date('2026-10-14T12:00:00'));
    await answer(order, true); await answer(choice, true);
    expect((await finishLesson(database, content, learner, lesson, [], now)).learnQuestEarned).toBe(true);
    expect(await xp()).toBe(60); // Yesterday's Learn, today's Learn, and two exercises.
  });
  it('counts attempts cumulatively and rewards a later first correct answer only once', async () => {
    await prerequisites();
    await answer(order, false); await answer(order, true); await answer(choice, true);
    expect((await finishLesson(database, content, learner, lesson, [], now)).correctAnswers).toBe(1);
    expect(await database.answers.get([learner, order])).toMatchObject({ correct: true, attempts: 2 });
    expect(await xp()).toBe(40);
  });
  it('preserves an earned exercise reward during an unfinished restart and repeated presses', async () => {
    await prerequisites();
    await Promise.all([answer(order, true), answer(order, true), answer(order, true)]);
    await answer(order, false);
    expect(await database.answers.get([learner, order])).toMatchObject({ correct: true, attempts: 1 });
    expect(await xp()).toBe(30);
  });
  it('requires attempts before SHOW ME can count an exercise as complete', async () => {
    await prerequisites();
    await answer(order, false); await answer(choice, true);
    await expect(finishLesson(database, content, learner, lesson, [order], now)).rejects.toThrow('Continue through');
    expect(await database.completions.get([learner, 'star-lesson'])).toBeUndefined();
  });
  it('lets two assisted exercises finish, with zero first-try score and no exercise XP', async () => {
    await prerequisites();
    for (const id of [order, choice]) { await answer(id, false); await answer(id, false); }
    expect((await finishLesson(database, content, learner, lesson, [order, choice], now)).correctAnswers).toBe(0);
    expect(await xp()).toBe(20);
    expect((await database.answers.toArray()).every(row => !row.correct && row.attempts === 2)).toBe(true);
    // A completed practice run never awards even previously unearned exercise XP.
    await answer(order, true); await answer(choice, true);
    expect(await xp()).toBe(20);
  });
  it('keeps replay unchanged, including a later day and simultaneous finish calls', async () => {
    await prerequisites(); await answer(order, true); await answer(choice, true);
    await Promise.all([finishLesson(database, content, learner, lesson, [], now), finishLesson(database, content, learner, lesson, [], now)]);
    const before = await readProgress(database);
    const tomorrow = new Date('2026-10-16T12:00:00');
    await answer(order, false, tomorrow);
    expect(await finishLesson(database, content, learner, lesson, [], tomorrow)).toEqual({ correctAnswers: 2, learnQuestEarned: false });
    expect(await readProgress(database)).toEqual(before);
    expect(await xp()).toBe(40);
  });
  it('rejects an unrelated exercise and an unfinished assessment', async () => {
    await prerequisites();
    await expect(answer('orion-choice', true)).rejects.toThrow('does not belong');
    await expect(finishLesson(database, content, learner, lesson, [], now)).rejects.toThrow('Continue through');
  });
});
