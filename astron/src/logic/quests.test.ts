import { describe, expect, it } from 'vitest';
import type { QuestDone } from '../data/types';
import { goalMet, questsDoneOn, sunStage } from './quests';

const record = (questId: string, dayDate = '2026-10-13'): QuestDone => ({ learnerId: 'one', dayDate, questId, doneOn: `${dayDate}T12:00:00Z`, xpEarned: 20 });

describe('Daily quests and sun', () => {
  it.each([0, 1, 2, 3] as const)('shows sun stage %s', count => expect(sunStage(count)).toBe(count));
  it('caps the sun at stage three', () => expect(sunStage(4)).toBe(3));
  it('counts each quest once on the requested day', () => {
    expect(questsDoneOn([record('learn'), record('learn'), record('story'), record('read', '2026-10-12')], '2026-10-13')).toBe(2);
  });
  it('counts zero on a day without records', () => expect(questsDoneOn([], '2026-10-13')).toBe(0));
  it.each([1, 2, 3] as const)('meets goal %s only at its threshold', goal => {
    expect(goalMet(goal - 1, goal)).toBe(false);
    expect(goalMet(goal, goal)).toBe(true);
    expect(goalMet(3, goal)).toBe(true);
  });
  it.each([-1, 1.5, NaN])('rejects invalid quest count %s', count => expect(() => sunStage(count)).toThrow(RangeError));
});
