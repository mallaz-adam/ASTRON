import type { AstronDb } from './db';
import { defaultLearner } from './learner';

export function acknowledgeIntroduction(database: AstronDb, learnerId: string, now: Date) {
  return database.transaction('rw', database.learners, async () => {
    const learner = await database.learners.get(learnerId) ?? defaultLearner(learnerId);
    if (learner.welcome?.introductionSeenOn || learner.welcome?.completedOn) return;
    await database.learners.put({ ...learner, welcome: {
      ...learner.welcome, startedOn: learner.welcome?.startedOn ?? now.toISOString(), introductionSeenOn: now.toISOString(),
    } });
  });
}
