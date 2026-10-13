import { describe, expect, it } from 'vitest';
import { addDays } from './dates';
import { closePastDays, computeStreak, dayKept, streakStage, type RuleDay } from './streak';

const keptDays = (): RuleDay[] => Array.from({ length: 13 }, (_, index) => ({ dayDate: addDays('2026-10-01', index), questsDone: 2, freezeUsed: false, dailyGoal: 2 }));

describe('Streaks', () => {
  it('counts thirteen consecutive kept days', () => expect(computeStreak('2026-10-13', keptDays(), 2)).toBe(13));
  it('breaks at a missed day without a freeze', () => {
    const days = keptDays(); days[6].questsDone = 0;
    expect(computeStreak('2026-10-13', days, 2)).toBe(6);
  });
  it('bridges a missed day protected by a freeze', () => {
    const days = keptDays(); days[6].questsDone = 0; days[6].freezeUsed = true;
    expect(computeStreak('2026-10-13', days, 2)).toBe(13);
  });
  it('keeps yesterday’s streak while today is unfinished', () => expect(computeStreak('2026-10-14', keptDays(), 2)).toBe(13));
  it('breaks once the unfinished day has passed midnight', () => expect(computeStreak('2026-10-15', keptDays(), 2)).toBe(0));
  it('breaks at a missing record', () => expect(computeStreak('2026-10-13', keptDays().filter(day => day.dayDate !== '2026-10-07'), 2)).toBe(6));
  it('starts at zero with no history', () => expect(computeStreak('2026-10-13', [], 2)).toBe(0));
  it('does not count records from the future', () => expect(computeStreak('2026-10-01', keptDays(), 2)).toBe(1));
  it('preserves historical goals after the current goal changes', () => {
    const days = keptDays().map(day => ({ ...day, questsDone: 1, dailyGoal: 1 as const }));
    expect(computeStreak('2026-10-14', days, 3)).toBe(13);
  });
  it('keeps a day with its goal or with a freeze', () => {
    const day = { dayDate: '2026-10-13', questsDone: 0, dailyGoal: 2 as const, freezeUsed: false };
    expect(dayKept(day)).toBe(false);
    expect(dayKept({ ...day, questsDone: 2 })).toBe(true);
    expect(dayKept({ ...day, freezeUsed: true })).toBe(true);
  });
  it.each([[0, 'none'], [1, 'dawn'], [6, 'dawn'], [7, 'morning'], [29, 'morning'], [30, 'noon'], [99, 'noon'], [100, 'corona']] as const)(
    'uses streak stage %s → %s', (days, stage) => expect(streakStage(days)).toBe(stage),
  );
});

describe('Closing past days', () => {
  it('uses freezes on missed days oldest first, then leaves misses', () => {
    const result = closePastDays('2026-10-10', '2026-10-13', [], 2, 2);
    expect(result.days.map(day => day.freezeUsed)).toEqual([true, true, false]);
    expect(result.freezesLeft).toBe(0);
  });
  it('does not spend a freeze on a kept or already frozen day', () => {
    const days = keptDays(); days[11].questsDone = 0; days[11].freezeUsed = true;
    expect(closePastDays('2026-10-11', '2026-10-13', days, 2, 2).freezesLeft).toBe(2);
  });
  it('leaves today open and changes none of the input records', () => {
    const days = keptDays(); days[11].questsDone = 0;
    const before = structuredClone(days);
    const result = closePastDays('2026-10-12', '2026-10-13', days, 2, 1);
    expect(result.days.map(day => day.dayDate)).toEqual(['2026-10-12']);
    expect(days).toEqual(before);
  });
  it('uses each day’s original goal when closing', () => {
    const day = { dayDate: '2026-10-12', questsDone: 1, freezeUsed: false, dailyGoal: 1 as const };
    expect(closePastDays('2026-10-12', '2026-10-13', [day], 3, 1).freezesLeft).toBe(1);
  });
  it('does nothing when no day has passed', () => expect(closePastDays('2026-10-13', '2026-10-13', [], 2, 1)).toEqual({ days: [], freezesLeft: 1 }));
  it('does nothing if the pretend clock moves backwards', () => expect(closePastDays('2026-10-14', '2026-10-13', [], 2, 1).days).toEqual([]));
});
