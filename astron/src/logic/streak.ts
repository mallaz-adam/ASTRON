import type { DailyGoal } from '../data/types';
import { addDays, validateDate } from './dates';
import { checkCount, checkGoal, goalMet } from './quests';

export type RuleDay = { dayDate: string; questsDone: number; freezeUsed: boolean; dailyGoal?: DailyGoal };
export type StreakStage = 'none' | 'dawn' | 'morning' | 'noon' | 'corona';

export function dayKept(day: RuleDay & { dailyGoal: DailyGoal }): boolean {
  return goalMet(day.questsDone, day.dailyGoal) || day.freezeUsed;
}

export function computeStreak(today: string, days: readonly RuleDay[], dailyGoal: DailyGoal): number {
  validateDate(today);
  checkGoal(dailyGoal);
  const byDate = new Map(days.map(day => [day.dayDate, day]));
  function kept(date: string) {
    const day = byDate.get(date);
    return day ? dayKept({ ...day, dailyGoal: day.dailyGoal ?? dailyGoal }) : false;
  }
  // An unfinished today does not break yesterday's streak until midnight.
  let cursor = kept(today) ? today : addDays(today, -1);
  let streak = 0;
  while (kept(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function streakStage(days: number): StreakStage {
  checkCount(days);
  if (days === 0) return 'none';
  if (days < 7) return 'dawn';
  if (days < 30) return 'morning';
  if (days < 100) return 'noon';
  return 'corona';
}

export function closePastDays(
  lastDay: string, today: string, days: readonly RuleDay[],
  dailyGoal: DailyGoal, freezesLeft: number,
): { days: RuleDay[]; freezesLeft: number } {
  validateDate(lastDay);
  validateDate(today);
  checkGoal(dailyGoal);
  checkCount(freezesLeft);
  const byDate = new Map(days.map(day => [day.dayDate, day]));
  const closed: RuleDay[] = [];
  // Close the last open day and every intervening day, oldest first; never today.
  for (let date = lastDay; date < today; date = addDays(date, 1)) {
    const saved = byDate.get(date);
    const day = { ...(saved ?? { dayDate: date, questsDone: 0, freezeUsed: false }), dailyGoal: saved?.dailyGoal ?? dailyGoal };
    if (!dayKept(day) && freezesLeft > 0) {
      day.freezeUsed = true;
      freezesLeft -= 1;
    }
    closed.push(day);
  }
  return { days: closed, freezesLeft };
}
