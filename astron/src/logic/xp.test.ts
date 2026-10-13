import { describe, expect, it } from 'vitest';
import type { Answer, Completion, Exercise, QuestDone } from '../data/types';
import { totalXp } from './xp';

const quest = (questId: string, xpEarned: number, dayDate = '2026-10-13'): QuestDone => ({ learnerId: 'one', dayDate, questId, xpEarned, doneOn: `${dayDate}T12:00:00Z` });
const quests = [quest('learn', 20), quest('story', 15), quest('read', 10)];
const completion: Completion = { learnerId: 'one', cellId: 'cell', completedOn: '2026-10-13T12:00:00Z', correctAnswers: 0, xpEarned: 5 };
const answer: Answer = { learnerId: 'one', exerciseId: 'exercise', answeredOn: '2026-10-13T12:00:00Z', correct: true, attempts: 1 };
const exercise: Exercise = { id: 'exercise', type: 'choice', prompt: 'Sample', contentData: {}, xpValue: 7, cellId: 'cell' };

describe('XP totals', () => {
  it('starts at zero', () => expect(totalXp([], [], [], [])).toBe(0));
  it('adds completion, daily quests, correct exercise, and ten-point bonus', () => expect(totalXp([completion], quests, [answer], [exercise])).toBe(67));
  it('awards no bonus for two quests', () => expect(totalXp([], quests.slice(0, 2), [], [])).toBe(35));
  it('awards exactly one bonus for each full day', () => expect(totalXp([], [...quests, ...quests.map(row => ({ ...row, dayDate: '2026-10-14' }))], [], [])).toBe(110));
  it('ignores duplicate quest completions and duplicate bonuses', () => expect(totalXp([], [...quests, ...quests], [], [])).toBe(55));
  it('keeps only the first cell reward', () => expect(totalXp([completion, { ...completion, completedOn: '2026-10-14T12:00:00Z', xpEarned: 100 }], [], [], [])).toBe(5));
  it('uses only the latest exercise answer, with no repeat reward', () => expect(totalXp([], [], [answer, { ...answer, attempts: 2 }], [exercise])).toBe(7));
  it('gives no exercise XP when the latest saved answer is incorrect', () => expect(totalXp([], [], [answer, { ...answer, answeredOn: '2026-10-14T12:00:00Z', correct: false }], [exercise])).toBe(0));
  it('does not invent XP for an exercise absent from content', () => expect(totalXp([], [], [answer], [])).toBe(0));
});
