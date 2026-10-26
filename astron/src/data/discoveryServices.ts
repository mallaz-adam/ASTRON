import type { AstronDb } from './db';
import { defaultLearner } from './learner';

// This only remembers an opened detail. It never completes a quest or a day.
export async function markDetailExplored(database: AstronDb, learnerId: string, detailId: string) {
  if (!detailId.trim() || detailId.length > 200) throw new Error('A detail needs a short, stable ID.');
  await database.transaction('rw', database.learners, async () => {
    const learner = await database.learners.get(learnerId) ?? defaultLearner(learnerId);
    if (learner.exploredDetails?.includes(detailId)) return;
    await database.learners.put({ ...learner, exploredDetails: [...(learner.exploredDetails ?? []), detailId] });
  });
}
