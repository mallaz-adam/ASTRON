import type { AstronDb } from './db';
import type { Content, QuestKind } from './types';
import { localDate } from '../logic/dates';
import { prepareDay } from './progressServices';

// This helper runs inside the caller's transaction, so XP and completion agree.
export async function saveQuest(database: AstronDb, content: Content, learnerId: string, kind: QuestKind, now: Date) {
  const quest = content.quests.find(row => row.kind === kind);
  if (!quest) throw new Error(`No ${kind} quest exists in the content.`);
  const dayDate = localDate(now);
  const key: [string, string, string] = [learnerId, dayDate, quest.id];
  if (await database.questDone.get(key)) return false;
  await database.questDone.add({ learnerId, dayDate, questId: quest.id, doneOn: now.toISOString(), xpEarned: quest.xpReward });
  return true;
}

// Used by the temporary page to simulate a quest without a learning screen.
export function completeQuest(database: AstronDb, content: Content, learnerId: string, kind: QuestKind, now: Date) {
  return database.transaction('rw', database.tables, async () => {
    await prepareDay(database, learnerId, now);
    return saveQuest(database, content, learnerId, kind, now);
  });
}
