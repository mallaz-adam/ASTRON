import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { defaultLearner, localLearnerId } from '../data/learner';
import type { Progress } from '../data/types';
import { addDays, atLocalNoon } from './dates';
import { buildSunModel, longestStreak, streakProgress, sunRays } from './sun';
import { buildTodayModel } from './today';
import type { KeptDay } from './week';

const today = '2026-10-14';
function days(count: number): KeptDay[] {
  return Array.from({ length: count }, (_, index) => ({ dayDate: addDays(today, index - count), questsDone: 2, dailyGoal: 2, freezeUsed: false }));
}
const content = sampleContent();
function saved(count: number): Progress {
  const history = days(count);
  return {
    learners: [defaultLearner(localLearnerId)], learnerInterests: [], completions: [], answers: [], litStars: [], articleReads: [],
    activityDays: history.map(day => ({ learnerId: localLearnerId, dayDate: day.dayDate, dailyGoal: day.dailyGoal, freezeUsed: day.freezeUsed })),
    questDone: history.flatMap(day => content.quests.slice(0, 2).map(quest => ({ learnerId: localLearnerId, dayDate: day.dayDate, questId: quest.id, doneOn: atLocalNoon(day.dayDate).toISOString(), xpEarned: quest.xpReward }))),
  };
}

describe('The streak ring', () => {
  it.each([
    [0, 'none', 7, 0], [1, 'dawn', 7, 1 / 7], [6, 'dawn', 7, 6 / 7],
    [7, 'morning', 30, 7 / 30], [13, 'morning', 30, 13 / 30], [29, 'morning', 30, 29 / 30],
    [30, 'noon', 100, .3], [99, 'noon', 100, .99], [100, 'corona', null, 1],
  ] as const)('shows the stage and ring at %s days', (streak, stage, target, ratio) => {
    const ring = streakProgress(streak);
    expect(ring.stage).toBe(stage);
    expect(ring.nextDayCount).toBe(target);
    expect(ring.ratio).toBeCloseTo(ratio);
  });
  it('places ticks every seven days toward Morning and Noon, and ten toward Corona', () => {
    expect(streakProgress(1).ticks).toEqual([0]);
    expect(streakProgress(13).ticks).toEqual([0, 7 / 30, 14 / 30, 21 / 30, 28 / 30]);
    expect(streakProgress(30).ticks).toEqual(Array.from({ length: 10 }, (_, index) => index / 10));
    expect(streakProgress(100).ticks).toEqual([]);
  });
  it('keeps Corona full beyond one hundred days', () => expect(streakProgress(300).ratio).toBe(1));
  it.each([-1, 1.5, NaN, Infinity])('rejects invalid streak %s', streak => expect(() => streakProgress(streak)).toThrow());
});

describe('Longest streak', () => {
  it('starts at zero without kept days', () => expect(longestStreak([])).toBe(0));
  it('finds the longest run across a missed day', () => {
    const history = days(13); history[6].questsDone = 0;
    expect(longestStreak(history)).toBe(6);
  });
  it('bridges a freeze-protected day', () => {
    const history = days(13); history[6].questsDone = 0; history[6].freezeUsed = true;
    expect(longestStreak(history)).toBe(13);
  });
  it('breaks at an absent calendar date', () => expect(longestStreak(days(13).filter((_, index) => index !== 4))).toBe(8));
  it('uses historical goals and sorts without mutating the input', () => {
    const history = days(7).map(day => ({ ...day, dailyGoal: 1 as const, questsDone: 1 })).reverse();
    const before = structuredClone(history);
    expect(longestStreak(history)).toBe(7);
    expect(history).toEqual(before);
  });
  it('counts a duplicated calendar date only once', () => expect(longestStreak([...days(3), ...days(3)])).toBe(3));
});

describe('The seven rays', () => {
  it('places unfinished today at the top, then earlier dates clockwise', () => {
    const rays = sunRays(today, days(5));
    expect(rays[0]).toMatchObject({ dayDate: today, state: 'notYet', angle: 0, isToday: true });
    expect(rays[1]).toMatchObject({ dayDate: addDays(today, -1), state: 'kept', angle: 360 / 7 });
    expect(rays[6]).toMatchObject({ dayDate: addDays(today, -6), state: 'missed' });
  });
  it('shows a kept today and a freeze as gold rays', () => {
    const history = days(6); history[3].questsDone = 0; history[3].freezeUsed = true;
    history.push({ dayDate: today, dailyGoal: 2, questsDone: 2, freezeUsed: false });
    expect(sunRays(today, history).every(ray => ray.state === 'kept')).toBe(true);
  });
  it('uses exactly the same dates and kept states as Today', () => {
    const progress = saved(5);
    const week = buildTodayModel(progress, content, atLocalNoon(today)).week;
    const rays = buildSunModel(progress, content, atLocalNoon(today)).rays;
    expect(rays.map(ray => ray.dayDate)).toEqual(week.map(day => day.dayDate).reverse());
    expect(rays.filter(ray => ray.state === 'kept').map(ray => ray.dayDate)).toEqual(week.filter(day => day.state === 'kept').map(day => day.dayDate).reverse());
  });
});

describe('Your sun copy and saved records', () => {
  it.each([
    [0, 'Every sun begins at dawn.'], [5, 'A dawn sun. Morning begins at day 7.'],
    [13, 'A morning sun. Noon begins at day 30.'], [30, 'A noon sun. Corona begins at day 100.'],
    [100, 'A corona sun, at its fullest.'],
  ])('describes a %s-day sun', (count, sentence) => {
    const model = buildSunModel(saved(Number(count)), content, atLocalNoon(today));
    expect(model.sentence).toBe(sentence);
    expect(model.longest).toBe(count);
    expect(model.speech).toBe(count === 0 ? 'Every sun begins with a small discovery. We can start here.' : `Your sun holds ${count} days of light. We can look again today.`);
    expect(model.description).toContain(`a streak of ${count} days`);
  });
  it('describes the real outer ring values', () => {
    expect(buildSunModel(saved(13), content, atLocalNoon(today)).description).toBe('Your sun: a streak of 13 days. Seven rays show the last seven days. The outer ring shows 13 of 30 days toward Noon.');
    expect(buildSunModel(saved(100), content, atLocalNoon(today)).description).toContain('The outer ring is full in Corona.');
  });
  it('ignores another learner and future pretend days', () => {
    const progress = saved(5);
    progress.activityDays.push({ learnerId: 'other', dayDate: '2026-10-01', dailyGoal: 1, freezeUsed: true });
    for (let offset = 1; offset <= 20; offset++) progress.activityDays.push({ learnerId: localLearnerId, dayDate: addDays(today, offset), dailyGoal: 2, freezeUsed: true });
    expect(buildSunModel(progress, content, atLocalNoon(today)).longest).toBe(5);
  });
});
