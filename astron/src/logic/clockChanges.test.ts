import { afterEach, describe, expect, it, vi } from 'vitest';
import { addDays, localDate } from './dates';
import { closePastDays, computeStreak, type RuleDay } from './streak';

afterEach(() => vi.unstubAllEnvs());

function keptDays(first: string, count: number): RuleDay[] {
  return Array.from({ length: count }, (_, index) => ({
    dayDate: addDays(first, index), questsDone: 2, dailyGoal: 2, freezeUsed: false,
  }));
}

describe('Calendar dates across clock changes', () => {
  it('counts the spring daylight-saving day despite its 23 hours', () => {
    vi.stubEnv('TZ', 'America/New_York');
    const midnight = new Date(2026, 2, 8);
    const nextMidnight = new Date(2026, 2, 9);
    expect((nextMidnight.getTime() - midnight.getTime()) / 3_600_000).toBe(23);
    expect(computeStreak(localDate(nextMidnight), keptDays('2026-03-07', 3), 2)).toBe(3);
    expect(closePastDays(localDate(midnight), localDate(nextMidnight), [], 2, 1).days).toHaveLength(1);
  });
  it('counts the autumn daylight-saving day despite its 25 hours', () => {
    vi.stubEnv('TZ', 'America/New_York');
    const midnight = new Date(2026, 10, 1);
    const nextMidnight = new Date(2026, 10, 2);
    expect((nextMidnight.getTime() - midnight.getTime()) / 3_600_000).toBe(25);
    expect(computeStreak(localDate(nextMidnight), keptDays('2026-10-31', 3), 2)).toBe(3);
    expect(closePastDays(localDate(midnight), localDate(nextMidnight), [], 2, 1).days).toHaveLength(1);
  });
  it('keeps an at-risk streak when the device moves to a time zone one date ahead', () => {
    const instant = new Date('2026-10-14T02:30:00Z');
    const days = keptDays('2026-10-11', 3);
    vi.stubEnv('TZ', 'America/New_York');
    expect(localDate(instant)).toBe('2026-10-13');
    expect(computeStreak(localDate(instant), days, 2)).toBe(3);
    vi.stubEnv('TZ', 'Asia/Tokyo');
    expect(localDate(instant)).toBe('2026-10-14');
    expect(computeStreak(localDate(instant), days, 2)).toBe(3);
    expect(days.map(day => day.dayDate)).toEqual(['2026-10-11', '2026-10-12', '2026-10-13']);
  });
  it('does not double-count or rewrite dates when the device moves backwards', () => {
    const instant = new Date('2026-10-13T01:30:00Z');
    const days = keptDays('2026-10-11', 3);
    vi.stubEnv('TZ', 'Asia/Tokyo');
    expect(computeStreak(localDate(instant), days, 2)).toBe(3);
    vi.stubEnv('TZ', 'America/Los_Angeles');
    expect(localDate(instant)).toBe('2026-10-12');
    expect(computeStreak(localDate(instant), days, 2)).toBe(2);
    expect(days).toHaveLength(3);
  });
});
