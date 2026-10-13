import type { AstronDb } from './db';
import type { DailyGoal, Learner, Progress } from './types';
import { checkGoal, questsDoneOn } from '../logic/quests';
import { localDate } from '../logic/dates';
import { closePastDays, type RuleDay } from '../logic/streak';

export function defaultLearner(id: string): Learner {
  return { id, displayName: 'Sky learner', dailyGoal: 2, language: 'en', reduceMotion: false, freezesLeft: 0 };
}

// Call inside a write transaction. No day or running streak is hidden in memory.
export async function prepareDay(database: AstronDb, learnerId: string, now: Date): Promise<Learner> {
  const today = localDate(now);
  const savedLearner = await database.learners.get(learnerId);
  let learner: Learner = savedLearner ?? defaultLearner(learnerId);
  if (!savedLearner) {
    await database.learners.add(learner);
  }
  const activity = await database.activityDays.where('learnerId').equals(learnerId).toArray();
  const quests = await database.questDone.where('learnerId').equals(learnerId).toArray();
  const lastDay = activity.map(day => day.dayDate).filter(date => date <= today).sort().at(-1);
  if (lastDay && lastDay < today) {
    const closed = closePastDays(lastDay, today, toRuleDays({ activityDays: activity, questDone: quests }), learner.dailyGoal, learner.freezesLeft);
    await database.activityDays.bulkPut(closed.days.map(day => ({
      learnerId, dayDate: day.dayDate, freezeUsed: day.freezeUsed, dailyGoal: day.dailyGoal ?? learner.dailyGoal,
    })));
    learner = { ...learner, freezesLeft: closed.freezesLeft };
    await database.learners.put(learner);
  }
  if (!await database.activityDays.get([learnerId, today])) {
    await database.activityDays.add({ learnerId, dayDate: today, freezeUsed: false, dailyGoal: learner.dailyGoal });
  }
  return learner;
}

export function openDay(database: AstronDb, learnerId: string, now: Date) {
  return database.transaction('rw', database.tables, () => prepareDay(database, learnerId, now));
}

export async function changeDailyGoal(database: AstronDb, learnerId: string, dailyGoal: DailyGoal, now: Date) {
  checkGoal(dailyGoal);
  return database.transaction('rw', database.tables, async () => {
    // Close older days using the old goal before changing today's choice.
    const learner = await prepareDay(database, learnerId, now);
    await database.learners.put({ ...learner, dailyGoal });
    await database.activityDays.update([learnerId, localDate(now)], { dailyGoal });
  });
}

export function toRuleDays(progress: Pick<Progress, 'activityDays' | 'questDone'>): RuleDay[] {
  return progress.activityDays.map(day => ({ ...day, questsDone: questsDoneOn(progress.questDone, day.dayDate) }));
}

export function readProgress(database: AstronDb): Promise<Progress> {
  return database.transaction('r', database.tables, async () => ({
    learners: await database.learners.toArray(), learnerInterests: await database.learnerInterests.toArray(),
    activityDays: await database.activityDays.toArray(), questDone: await database.questDone.toArray(),
    completions: await database.completions.toArray(), answers: await database.answers.toArray(),
    litStars: await database.litStars.toArray(), articleReads: await database.articleReads.toArray(),
  }));
}

export function exportProgress(database: AstronDb): Promise<string> {
  return readProgress(database).then(progress => JSON.stringify(progress, null, 2));
}

export function eraseProgress(database: AstronDb): Promise<void> {
  return database.transaction('rw', database.tables, async () => {
    for (const table of database.tables) await table.clear();
  });
}
