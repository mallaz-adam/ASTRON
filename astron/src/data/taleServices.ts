import type { AstronDb } from './db';
import type { Content, DailyGoal, TaleVisit } from './types';
import { prepareDay, changeDailyGoal } from './progressServices';
import { completeCell, lightStar } from './learningServices';
import { evaluateBeltChoice, firstTaleId, isBeltChoice } from '../logic/taleJourney';

function chaptersFor(content: Content, taleId: string) {
  if (!content.tales.some(tale => tale.id === taleId && tale.reader)) throw new Error('This story is not available yet.');
  const chapters = content.chapters.filter(chapter => chapter.taleId === taleId).sort((a, b) => a.number - b.number);
  if (!chapters.length || chapters.some((chapter, index) => chapter.number !== index + 1)) throw new Error('The story chapters must be in order.');
  return chapters;
}

async function savedVisit(database: AstronDb, learnerId: string, taleId: string) {
  const learner = await database.learners.get(learnerId);
  if (!learner?.taleVisit || learner.taleVisit.taleId !== taleId) throw new Error('Begin this story first.');
  return learner.taleVisit;
}

async function saveVisit(database: AstronDb, learnerId: string, visit: TaleVisit) {
  // Read the latest learner after nested quest/day services; never overwrite a
  // goal, a spent freeze or a motion preference with a stale render snapshot.
  const learner = await database.learners.get(learnerId);
  if (!learner) throw new Error('Your progress could not be found.');
  await database.learners.put({ ...learner, taleVisit: visit });
  return visit;
}

export function startTaleVisit(database: AstronDb, content: Content, learnerId: string, taleId: string, now: Date, options: { welcome?: boolean; restart?: boolean } = {}) {
  chaptersFor(content, taleId);
  if (options.welcome && taleId !== firstTaleId) throw new Error('The first story is Orion.');
  return database.transaction('rw', database.tables, async () => {
    const learner = await prepareDay(database, learnerId, now);
    if (options.welcome && !learner.welcome) await database.learners.update(learnerId, { welcome: { startedOn: now.toISOString() } });
    const previous = learner.taleVisit;
    if (!options.restart && previous?.taleId === taleId) return previous;
    return saveVisit(database, learnerId, { taleId, stage: 'story', chapter: 1, readThrough: false });
  });
}

export function advanceTaleVisit(database: AstronDb, content: Content, learnerId: string, taleId: string) {
  const chapters = chaptersFor(content, taleId);
  return database.transaction('rw', database.learners, async () => {
    const visit = await savedVisit(database, learnerId, taleId);
    if (visit.stage === 'story') return saveVisit(database, learnerId, visit.chapter < chapters.length
      ? { ...visit, chapter: visit.chapter + 1 }
      : { ...visit, stage: 'star', readThrough: true });
    if (visit.stage === 'activity' && visit.beltOutcome) return saveVisit(database, learnerId, { ...visit, stage: 'sky' });
    if (visit.stage === 'sky') return saveVisit(database, learnerId, { ...visit, stage: 'preferences' });
    throw new Error('Finish this part before continuing.');
  });
}

export function previousTaleChapter(database: AstronDb, learnerId: string, taleId: string) {
  return database.transaction('rw', database.learners, async () => {
    const visit = await savedVisit(database, learnerId, taleId);
    if (visit.stage !== 'story' || visit.chapter <= 1) return visit;
    return saveVisit(database, learnerId, { ...visit, chapter: visit.chapter - 1 });
  });
}

export function collectTaleStar(database: AstronDb, content: Content, learnerId: string, taleId: string, now: Date) {
  chaptersFor(content, taleId);
  return database.transaction('rw', database.tables, async () => {
    const visit = await savedVisit(database, learnerId, taleId);
    if (!visit.readThrough || !['star', 'activity', 'sky', 'preferences'].includes(visit.stage)) throw new Error('Read the story before lighting its star.');
    const tale = content.tales.find(row => row.id === taleId)!;
    const cell = content.cells.find(row => row.kind === 'tale' && row.taleId === taleId);
    if (!cell) throw new Error('This story needs its shared course cell.');
    // Deliberately use the existing tale rule: Learn + Discover, no new reward
    // for the picture activity and no fabricated prerequisite completions.
    await completeCell(database, content, learnerId, cell.id, now);
    await lightStar(database, content, learnerId, tale.starId, 'tale', now);
    if (visit.stage === 'star') await saveVisit(database, learnerId, { ...visit, stage: 'activity' });
  });
}

export function answerBeltActivity(database: AstronDb, content: Content, learnerId: string, taleId: string, choice: string) {
  if (choice !== 'show-me' && !isBeltChoice(choice)) throw new Error('Choose one group of stars.');
  return database.transaction('rw', database.learners, database.litStars, async () => {
    const visit = await savedVisit(database, learnerId, taleId);
    const tale = content.tales.find(row => row.id === taleId);
    if (visit.stage !== 'activity' || !tale || !await database.litStars.get([learnerId, tale.starId])) throw new Error('Light your star before this activity.');
    if (choice !== 'show-me' && !evaluateBeltChoice(choice)) return false;
    if (!visit.beltOutcome) await saveVisit(database, learnerId, { ...visit, beltOutcome: choice === 'show-me' ? 'assisted' : 'independent' });
    return true;
  });
}

export function finishWelcome(database: AstronDb, content: Content, learnerId: string, interests: string[], dailyGoal: DailyGoal, reduceMotion: boolean, now: Date) {
  if (interests.some(id => !content.interests.some(interest => interest.id === id))) throw new Error('Choose an interest from this page.');
  if (typeof reduceMotion !== 'boolean') throw new Error('Choose a motion preference.');
  return database.transaction('rw', database.tables, async () => {
    const learner = await database.learners.get(learnerId);
    if (learner?.welcome?.completedOn) return;
    if (!learner?.welcome || learner.taleVisit?.stage !== 'preferences' || !learner.taleVisit.beltOutcome) throw new Error('Finish the Orion experience before choosing your goal.');
    await changeDailyGoal(database, learnerId, dailyGoal, now);
    await database.learnerInterests.where('learnerId').equals(learnerId).delete();
    await database.learnerInterests.bulkPut([...new Set(interests)].map(interestId => ({ learnerId, interestId })));
    const updated = (await database.learners.get(learnerId))!;
    await database.learners.put({ ...updated, reduceMotion, welcome: { ...learner.welcome, completedOn: now.toISOString() } });
  });
}
