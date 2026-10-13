import type { DailyGoal, QuestDone } from '../data/types';

export function checkCount(value: number) {
  if (!Number.isInteger(value) || value < 0) throw new RangeError('A count must be a whole number, zero or greater.');
}

export function checkGoal(value: number): asserts value is DailyGoal {
  if (![1, 2, 3].includes(value)) throw new RangeError('The daily goal must be 1, 2, or 3.');
}

// Pass one learner's records. Repeated records for a quest count only once.
export function questsDoneOn(records: readonly QuestDone[], dayDate: string): number {
  return new Set(records.filter(record => record.dayDate === dayDate).map(record => record.questId)).size;
}

export function sunStage(questsDone: number): 0 | 1 | 2 | 3 {
  checkCount(questsDone);
  return Math.min(3, questsDone) as 0 | 1 | 2 | 3;
}

export function goalMet(questsDone: number, dailyGoal: DailyGoal): boolean {
  checkCount(questsDone);
  checkGoal(dailyGoal);
  return questsDone >= dailyGoal;
}
