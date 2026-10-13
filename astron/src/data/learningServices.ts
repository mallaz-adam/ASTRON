import type { AstronDb } from './db';
import type { Content, LitStar } from './types';
import { checkCount } from '../logic/quests';
import { localDate } from '../logic/dates';
import { prepareDay } from './progressServices';
import { saveQuest } from './questServices';

type CellResult = { xpEarned?: number; correctAnswers?: number };

export function completeCell(database: AstronDb, content: Content, learnerId: string, cellId: string, now: Date, result: CellResult = {}) {
  const cell = content.cells.find(row => row.id === cellId);
  if (!cell) throw new Error(`Unknown cell: ${cellId}`);
  const xpEarned = result.xpEarned ?? 0;
  const correctAnswers = result.correctAnswers ?? 0;
  checkCount(xpEarned);
  checkCount(correctAnswers);
  return database.transaction('rw', database.tables, async () => {
    await prepareDay(database, learnerId, now);
    const firstCompletion = !await database.completions.get([learnerId, cellId]);
    if (firstCompletion) {
      await database.completions.add({ learnerId, cellId, completedOn: now.toISOString(), correctAnswers, xpEarned });
    }
    // A repeat can meet today's quest; the cell reward is never awarded twice.
    await saveQuest(database, content, learnerId, 'learn', now);
    if (cell.kind === 'tale') await saveQuest(database, content, learnerId, 'story', now);
    return firstCompletion;
  });
}

export function markArticleRead(database: AstronDb, content: Content, learnerId: string, articleId: string, now: Date) {
  if (!content.articles.some(row => row.id === articleId)) throw new Error(`Unknown article: ${articleId}`);
  return database.transaction('rw', database.tables, async () => {
    await prepareDay(database, learnerId, now);
    if (!await database.articleReads.get([learnerId, articleId])) {
      await database.articleReads.add({ learnerId, articleId, readOn: now.toISOString() });
    }
    await saveQuest(database, content, learnerId, 'read', now);
  });
}

export function lightStar(database: AstronDb, content: Content, learnerId: string, starId: string, how: LitStar['how'], now: Date) {
  if (!content.stars.some(row => row.id === starId)) throw new Error(`Unknown star: ${starId}`);
  if (!['tale', 'lesson', 'sighting'].includes(how)) throw new Error('Unknown way of lighting a star.');
  localDate(now);
  return database.transaction('rw', database.tables, async () => {
    if (!await database.learners.get(learnerId)) throw new Error('Create a learner before lighting a star.');
    if (await database.litStars.get([learnerId, starId])) return false;
    await database.litStars.add({ learnerId, starId, litOn: now.toISOString(), how });
    return true;
  });
}

export function recordAnswer(database: AstronDb, content: Content, learnerId: string, exerciseId: string, correct: boolean, now: Date) {
  if (!content.exercises.some(row => row.id === exerciseId)) throw new Error(`Unknown exercise: ${exerciseId}`);
  if (typeof correct !== 'boolean') throw new Error('The answer result must be true or false.');
  return database.transaction('rw', database.tables, async () => {
    await prepareDay(database, learnerId, now);
    const previous = await database.answers.get([learnerId, exerciseId]);
    if (previous && now.toISOString() < previous.answeredOn) throw new Error('This answer is older than the saved result.');
    await database.answers.put({ learnerId, exerciseId, answeredOn: now.toISOString(), correct, attempts: (previous?.attempts ?? 0) + 1 });
  });
}
