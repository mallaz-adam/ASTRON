import type { DailyGoal } from '../data/types';
import { addDays, atLocalNoon } from './dates';
import { dayKept, type RuleDay } from './streak';

export type KeptDay = RuleDay & { dailyGoal: DailyGoal };

// Both screens describe the same seven calendar dates, oldest first.
export function weekDays(today: string, days: readonly KeptDay[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    const saved = days.find(day => day.dayDate === date);
    const kept = saved ? dayKept(saved) : false;
    const isToday = date === today;
    const state: 'kept' | 'missed' | 'today' = kept ? 'kept' : isToday ? 'today' : 'missed';
    const weekday = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(atLocalNoon(date));
    return { dayDate: date, weekday, initial: weekday[0], state, isToday, freezeUsed: saved?.freezeUsed ?? false };
  });
}
