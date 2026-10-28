import type { AstronDb } from './db';
import type { Content, HunchChoice } from './types';
import { completeCell, lightStar, recordAnswer } from './learningServices';
import { readProgress } from './progressServices';
import { buildCoursePath } from '../logic/coursePath';
import { localDate } from '../logic/dates';
import { hunchTint } from '../logic/stars';

async function availableLesson(database: AstronDb, content: Content, learnerId: string, lessonId: string) {
  const lesson = content.lessons.find(row => row.id === lessonId && !row.placeholder);
  if (!lesson) throw new Error('Lesson is not available.');
  const cell = content.cells.find(row => row.id === lesson.cellId)!;
  // Normal screens expose authored content in both builds. Use the identical
  // path here so a local learner is not blocked by development-only placeholders.
  const path = buildCoursePath(content, await readProgress(database), learnerId, cell.unitId, true);
  if (path.cells.find(row => row.id === cell.id)?.state === 'locked') throw new Error('Finish the cell before it to open this one.');
  return lesson;
}

export function finishReadingLesson(database: AstronDb, content: Content, learnerId: string, lessonId: string, now: Date) {
  return database.transaction('rw', database.tables, async () => {
    const lesson = await availableLesson(database, content, learnerId, lessonId);
    if (!lesson.reader) throw new Error('This lesson uses a different reader.');
    // Optional practice stays in the view. It is not a scored assessment and
    // never needs to be submitted to complete an individual reading lesson.
    if (await database.completions.get([learnerId, lesson.cellId])) return { learnQuestEarned: false };
    const learn = content.quests.find(q => q.kind === 'learn')!;
    const learnQuestEarned = !await database.questDone.get([learnerId, localDate(now), learn.id]);
    await completeCell(database, content, learnerId, lesson.cellId, now);
    return { learnQuestEarned };
  });
}

export function saveLessonAnswer(database: AstronDb, content: Content, learnerId: string, lessonId: string, exerciseId: string, correct: boolean, now: Date) {
  return database.transaction('rw', database.tables, async () => {
    const lesson = await availableLesson(database, content, learnerId, lessonId);
    if (!lesson.cards.some(card => card.kind === 'exercise' && card.exerciseId === exerciseId)) throw new Error('Exercise does not belong to this lesson.');
    // Practice never rewrites the original assessment or changes an earned reward.
    if (await database.completions.get([learnerId, lesson.cellId])) return;
    const answer = await database.answers.get([learnerId, exerciseId]);
    if (answer?.correct) return;
    await recordAnswer(database, content, learnerId, exerciseId, correct, now);
  });
}

export function finishLesson(database: AstronDb, content: Content, learnerId: string, lessonId: string, revealed: readonly string[], now: Date, hunch?: HunchChoice) {
  return database.transaction('rw', database.tables, async () => {
    const lesson = await availableLesson(database, content, learnerId, lessonId);
    const previous = await database.completions.get([learnerId, lesson.cellId]);
    async function lightClue() {
      if (lesson.id === 'lesson-03') await lightStar(database, content, learnerId, 'star-clue-03', 'lesson', now, hunchTint(hunch));
    }
    if (previous) {
      // Also gives pre-Task-9 learners their first clue when they replay.
      await lightClue();
      return { correctAnswers: previous.correctAnswers, learnQuestEarned: false };
    }
    const exercises = lesson.cards.filter(card => card.kind === 'exercise');
    let correctAnswers = 0;
    for (const card of exercises) {
      const answer = await database.answers.get([learnerId, card.exerciseId]);
      if (!answer || (!answer.correct && !(revealed.includes(card.exerciseId) && answer.attempts >= 2))) throw new Error('Continue through the exercises before finishing.');
      if (answer.correct && answer.attempts === 1) correctAnswers++;
    }
    const learn = content.quests.find(quest => quest.kind === 'learn')!;
    const learnQuestEarned = !await database.questDone.get([learnerId, localDate(now), learn.id]);
    await completeCell(database, content, learnerId, lesson.cellId, now, { correctAnswers });
    await lightClue();
    return { correctAnswers, learnQuestEarned };
  });
}
