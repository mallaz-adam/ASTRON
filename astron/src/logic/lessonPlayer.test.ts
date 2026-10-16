import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { canCheck, checkExercise, chooseHunch, firstTryCount, newLessonRun, revealExercise, selectItem, showCard, undoItem, useHint, visibleCardCount } from './lessonPlayer';

const content = sampleContent();
const lesson = content.lessons.find(row => row.id === 'lesson-03')!;
const order = content.exercises.find(row => row.id === 'ex-03-order')!;
const choice = content.exercises.find(row => row.id === 'ex-03-choice')!;

describe('Lesson player rules', () => {
  it('keeps the hunch gated until chosen, then reveals one card at a time', () => {
    const start = newLessonRun(lesson);
    expect(visibleCardCount(start)).toBe(1);
    expect(showCard(start, lesson, 5)).toBe(start);
    expect(showCard(start, lesson, 0).done.every(value => !value)).toBe(true);
    const first = chooseHunch(start, lesson, 'blue');
    expect(first.done).toEqual([true, false, false, false, false, false, false, false]);
    expect(visibleCardCount(first)).toBe(2);
    const second = showCard(first, lesson, 1);
    const third = showCard(second, lesson, 2);
    expect(third.done[2]).toBe(false);
    expect(visibleCardCount(third)).toBe(3);
  });
  it('places unique order items, supports undo, and enables CHECK only when complete', () => {
    let run = newLessonRun(lesson);
    run = selectItem(run, order, 'blue');
    expect(selectItem(run, order, 'blue')).toBe(run);
    expect(canCheck(order, run.answers[order.id])).toBe(false);
    run = undoItem(run, order);
    expect(run.answers[order.id].selection).toEqual([]);
    for (const id of ['red', 'orange', 'blue']) run = selectItem(run, order, id);
    expect(canCheck(order, run.answers[order.id])).toBe(true);
    const result = checkExercise(run, lesson, order);
    expect(result.correct).toBe(true); expect(result.run.done[2]).toBe(true);
    expect(result.run.answers[order.id].attempts).toBe(1);
    expect(firstTryCount(result.run)).toBe(1);
  });
  it('keeps missed discs in their slots and allows unlimited undo and retry', () => {
    let run = newLessonRun(lesson);
    for (let attempt = 1; attempt <= 3; attempt++) {
      for (const id of ['blue', 'orange', 'red']) run = selectItem(run, order, id);
      const result = checkExercise(run, lesson, order);
      expect(result.correct).toBe(false); run = result.run;
      expect(run.done[2]).toBe(false); expect(run.answers[order.id].selection).toEqual(['blue', 'orange', 'red']);
      for (let slot = 0; slot < 3; slot++) run = undoItem(run, order);
    }
    for (const id of ['red', 'orange', 'blue']) run = selectItem(run, order, id);
    run = checkExercise(run, lesson, order).run;
    expect(run.answers[order.id]).toMatchObject({ attempts: 4, status: 'correct' });
  });
  it('allows SHOW ME only after two misses, without treating it as a correct answer', () => {
    let run = newLessonRun(lesson);
    expect(revealExercise(run, lesson, order)).toBe(run);
    for (let attempt = 0; attempt < 2; attempt++) {
      for (let slot = 0; slot < 3; slot++) run = undoItem(run, order);
      for (const id of ['blue', 'red', 'orange']) run = selectItem(run, order, id);
      run = checkExercise(run, lesson, order).run;
    }
    run = revealExercise(run, lesson, order);
    expect(run.answers[order.id]).toMatchObject({ status: 'revealed', selection: ['red', 'orange', 'blue'], attempts: 2 });
    expect(run.done[2]).toBe(true);
    expect(firstTryCount(run)).toBe(0);
  });
  it('grades the heavier choice and does not mutate a solved answer', () => {
    let run = newLessonRun(lesson);
    run = selectItem(run, choice, 'B'); run = selectItem(run, choice, 'A');
    const solved = checkExercise(run, lesson, choice).run;
    expect(solved.answers[choice.id]).toMatchObject({ status: 'correct', selection: ['A'], attempts: 1 });
    expect(selectItem(solved, choice, 'B')).toBe(solved);
  });
  it('starts practice from eight empty cards, no hunch and fresh answers', () => {
    const first = newLessonRun(lesson); first.done.fill(true);
    expect(newLessonRun(lesson).done.every(value => !value)).toBe(true);
    expect(newLessonRun(lesson).answers[order.id]).toMatchObject({ selection: [], attempts: 0, status: 'ready' });
    expect(newLessonRun(lesson).hunch).toBeUndefined();
  });
  it.each(['blue', 'orange', 'red', 'skipped'] as const)('keeps the %s hunch only in session memory with no answer or score', choice => {
    const start = newLessonRun(lesson);
    const chosen = chooseHunch(start, lesson, choice);
    expect(chosen.hunch).toBe(choice);
    expect(chosen.done[0]).toBe(true);
    expect(chosen.answers).toBe(start.answers);
    expect(firstTryCount(chosen)).toBe(0);
    expect(newLessonRun(lesson).hunch).toBeUndefined();
  });
  it('remembers a requested hint without adding an attempt or completing the exercise', () => {
    let run = useHint(newLessonRun(lesson), order);
    expect(run.answers[order.id]).toMatchObject({ hintUsed: true, attempts: 0, status: 'ready' });
    expect(run.done[2]).toBe(false);
    expect(canCheck(order, run.answers[order.id])).toBe(false);
    for (const id of ['red', 'orange', 'blue']) run = selectItem(run, order, id);
    run = checkExercise(run, lesson, order).run;
    expect(firstTryCount(run)).toBe(1); // Reactions do not change the existing assessment rules.
  });
});
