import type { Exercise, HunchChoice, Lesson } from '../data/types';

export type ExerciseItem = { id: string; text: string; colour?: string };
export type ExerciseRun = { selection: string[]; attempts: number; hintUsed: boolean; status: 'ready' | 'missed' | 'correct' | 'revealed' };
export type LessonRun = { active: number; done: boolean[]; hunch?: HunchChoice; answers: Record<string, ExerciseRun> };

export function exerciseItems(exercise: Exercise): ExerciseItem[] {
  return (exercise.type === 'choice' ? exercise.contentData.options : exercise.contentData.items) as ExerciseItem[];
}
export function correctSelection(exercise: Exercise): string[] {
  return exercise.type === 'choice' ? [exercise.contentData.correctOptionId as string] : exercise.contentData.correctOrder as string[];
}
export function newLessonRun(lesson: Lesson): LessonRun {
  return { active: 0, done: lesson.cards.map(() => false), answers: Object.fromEntries(lesson.cards.filter(card => card.kind === 'exercise').map(card => [card.exerciseId, { selection: [], attempts: 0, hintUsed: false, status: 'ready' }])) };
}
export function visibleCardCount(run: LessonRun): number {
  const first = run.done.indexOf(false);
  return first === -1 ? run.done.length : first + 1;
}
export function showCard(run: LessonRun, lesson: Lesson, index: number): LessonRun {
  if (index < 0 || index >= visibleCardCount(run)) return run;
  const done = [...run.done];
  if (!['exercise', 'hunch'].includes(lesson.cards[index].kind)) done[index] = true;
  if (run.active === index && done.every((value, i) => value === run.done[i])) return run;
  return { ...run, active: index, done };
}
export function chooseHunch(run: LessonRun, lesson: Lesson, choice: HunchChoice): LessonRun {
  const index = lesson.cards.findIndex(card => card.kind === 'hunch');
  const card = lesson.cards[index];
  if (!card || card.kind !== 'hunch' || index >= visibleCardCount(run)) return run;
  if (choice !== 'skipped' && !card.options.some(option => option.id === choice)) return run;
  return { ...run, hunch: choice, done: run.done.map((done, position) => position === index || done) };
}
export function exerciseDone(answer: ExerciseRun): boolean {
  return answer.status === 'correct' || answer.status === 'revealed';
}
export function firstTryCount(run: LessonRun): number {
  return Object.values(run.answers).filter(answer => answer.status === 'correct' && answer.attempts === 1).length;
}
export function selectItem(run: LessonRun, exercise: Exercise, id: string): LessonRun {
  const answer = run.answers[exercise.id];
  if (exerciseDone(answer) || !exerciseItems(exercise).some(item => item.id === id)) return run;
  if (exercise.type === 'order' && answer.selection.includes(id)) return run;
  const selection = exercise.type === 'choice' ? [id] : [...answer.selection, id];
  return { ...run, answers: { ...run.answers, [exercise.id]: { ...answer, selection } } };
}
export function undoItem(run: LessonRun, exercise: Exercise): LessonRun {
  const answer = run.answers[exercise.id];
  if (exercise.type !== 'order' || exerciseDone(answer)) return run;
  return { ...run, answers: { ...run.answers, [exercise.id]: { ...answer, selection: answer.selection.slice(0, -1) } } };
}
export function useHint(run: LessonRun, exercise: Exercise): LessonRun {
  const answer = run.answers[exercise.id];
  if (exerciseDone(answer)) return run;
  return { ...run, answers: { ...run.answers, [exercise.id]: { ...answer, hintUsed: true } } };
}
export function canCheck(exercise: Exercise, answer: ExerciseRun): boolean {
  return !exerciseDone(answer) && answer.selection.length === (exercise.type === 'choice' ? 1 : exerciseItems(exercise).length);
}
function finishExercise(run: LessonRun, lesson: Lesson, exercise: Exercise, answer: ExerciseRun): LessonRun {
  return {
    ...run, answers: { ...run.answers, [exercise.id]: answer },
    done: run.done.map((done, index) => lesson.cards[index].kind === 'exercise' && lesson.cards[index].exerciseId === exercise.id ? exerciseDone(answer) : done),
  };
}
export function checkExercise(run: LessonRun, lesson: Lesson, exercise: Exercise) {
  const answer = run.answers[exercise.id];
  if (!canCheck(exercise, answer)) throw new Error('Choose an answer before CHECK.');
  const correct = JSON.stringify(answer.selection) === JSON.stringify(correctSelection(exercise));
  return { correct, run: finishExercise(run, lesson, exercise, {
    ...answer, selection: [...answer.selection], attempts: answer.attempts + 1, status: correct ? 'correct' : 'missed',
  }) };
}
export function revealExercise(run: LessonRun, lesson: Lesson, exercise: Exercise): LessonRun {
  const answer = run.answers[exercise.id];
  if (answer.attempts < 2 || exerciseDone(answer)) return run;
  return finishExercise(run, lesson, exercise, { ...answer, status: 'revealed', selection: [...correctSelection(exercise)] });
}
