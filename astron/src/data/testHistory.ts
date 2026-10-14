import type { AstronDb } from './db';
import type { Content } from './types';
import { defaultLearner } from './learner';
import { addDays, atLocalNoon, localDate } from '../logic/dates';
import { checkCount } from '../logic/quests';

// Only /dev calls this: replace day/quest history, leaving other saved data alone.
export function createTestHistory(database: AstronDb, content: Content, learnerId: string, count: number, now: Date) {
  checkCount(count);
  const today = localDate(now);
  return database.transaction('rw', database.learners, database.activityDays, database.questDone, async () => {
    const learner = await database.learners.get(learnerId) ?? defaultLearner(learnerId);
    const quests = content.quests.slice(0, learner.dailyGoal);
    if (quests.length < learner.dailyGoal) throw new Error('Not enough quests for the daily goal.');
    await database.learners.put(learner);
    await database.activityDays.where('learnerId').equals(learnerId).delete();
    await database.questDone.where('learnerId').equals(learnerId).delete();
    for (let offset = -count; offset <= 0; offset++) {
      const dayDate = addDays(today, offset);
      await database.activityDays.add({ learnerId, dayDate, dailyGoal: learner.dailyGoal, freezeUsed: false });
      if (offset < 0) await database.questDone.bulkAdd(quests.map(quest => ({
        learnerId, dayDate, questId: quest.id, doneOn: atLocalNoon(dayDate).toISOString(), xpEarned: quest.xpReward,
      })));
    }
  });
}
