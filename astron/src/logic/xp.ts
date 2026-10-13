import type { Answer, Completion, Exercise, QuestDone } from '../data/types';

// XP is derived, never saved as a running total. Pass one learner's records.
export function totalXp(
  completions: readonly Completion[], quests: readonly QuestDone[],
  answers: readonly Answer[], exercises: readonly Exercise[],
): number {
  const firstCompletions = new Map<string, Completion>();
  for (const completion of completions) {
    const old = firstCompletions.get(completion.cellId);
    if (!old || completion.completedOn < old.completedOn) firstCompletions.set(completion.cellId, completion);
  }
  const uniqueQuests = new Map<string, QuestDone>();
  for (const quest of quests) {
    const key = JSON.stringify([quest.dayDate, quest.questId]);
    const old = uniqueQuests.get(key);
    if (!old || quest.doneOn < old.doneOn) uniqueQuests.set(key, quest);
  }
  const latestAnswers = new Map<string, Answer>();
  for (const answer of answers) {
    const old = latestAnswers.get(answer.exerciseId);
    if (!old || answer.answeredOn >= old.answeredOn) latestAnswers.set(answer.exerciseId, answer);
  }
  const values = new Map(exercises.map(exercise => [exercise.id, exercise.xpValue]));
  const dailyQuests = new Map<string, number>();
  for (const quest of uniqueQuests.values()) dailyQuests.set(quest.dayDate, (dailyQuests.get(quest.dayDate) ?? 0) + 1);
  const completionXp = [...firstCompletions.values()].reduce((sum, row) => sum + row.xpEarned, 0);
  const questXp = [...uniqueQuests.values()].reduce((sum, row) => sum + row.xpEarned, 0);
  const exerciseXp = [...latestAnswers.values()].reduce((sum, row) => sum + (row.correct ? values.get(row.exerciseId) ?? 0 : 0), 0);
  const bonusXp = [...dailyQuests.values()].filter(count => count === 3).length * 10;
  return completionXp + questXp + exerciseXp + bonusXp;
}
