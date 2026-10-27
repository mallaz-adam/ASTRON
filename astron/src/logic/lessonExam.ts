import type { Content, Lesson } from '../data/types';
import { correctSelection, exerciseItems } from './lessonPlayer';

export type ExamAnswers = Record<string, string[]>;
export function gradeLessonExam(lesson: Lesson, content: Content, answers: ExamAnswers) {
  const ids = lesson.cards.flatMap(card => card.kind === 'exercise' ? [card.exerciseId] : []);
  if (!ids.length || Object.keys(answers).some(id => !ids.includes(id))) throw new Error('This exam contains an unknown question.');
  const results = ids.map(exerciseId => {
    const exercise = content.exercises.find(row => row.id === exerciseId);
    if (!exercise || exercise.cellId !== lesson.cellId) throw new Error('This question does not belong to the lesson.');
    const selection = answers[exerciseId];
    const items = exerciseItems(exercise);
    const count = exercise.type === 'choice' ? 1 : items.length;
    if (!Array.isArray(selection) || selection.length !== count || new Set(selection).size !== count || selection.some(id => !items.some(item => item.id === id))) throw new Error('Answer every question before submitting the exam.');
    return { exerciseId, selection: [...selection], correct: JSON.stringify(selection) === JSON.stringify(correctSelection(exercise)) };
  });
  return { results, correct: results.filter(r => r.correct).length, total: results.length };
}

export function modelAtSunWidth(sunCm: number) {
  if (!Number.isFinite(sunCm) || sunCm < 5 || sunCm > 20) throw new Error('Choose a model Sun between 5 and 20 cm.');
  // NASA sizes/distances in km. Outputs are model millimetres/metres/km.
  const factor = sunCm / 1_400_000;
  return { earthMm: 12_800 * factor * 10, earthM: 149_600_000 * factor / 100, neptuneM: 4_495_000_000 * factor / 100, neighbourKm: 265_000 * 149_600_000 * factor / 100_000 };
}
