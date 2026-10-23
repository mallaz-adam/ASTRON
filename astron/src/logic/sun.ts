import type { Content, Progress } from '../data/types';
import { localLearnerId } from '../data/learner';
import { addDays, validateDate } from './dates';
import { checkCount, questsDoneOn } from './quests';
import { dayKept, streakStage } from './streak';
import { buildTodayModel } from './today';
import { weekDays, type KeptDay } from './week';
import { glauxLine } from './glauxVoice';

export function longestStreak(days: readonly KeptDay[]): number {
  const sorted = [...new Map(days.map(day => [day.dayDate, day])).values()].sort((a, b) => a.dayDate.localeCompare(b.dayDate));
  let longest = 0;
  let run = 0;
  let previous: string | undefined;
  for (const day of sorted) {
    validateDate(day.dayDate);
    run = dayKept(day) ? (previous && addDays(previous, 1) === day.dayDate ? run + 1 : 1) : 0;
    longest = Math.max(longest, run);
    previous = day.dayDate;
  }
  return longest;
}

export function streakProgress(streak: number) {
  checkCount(streak);
  const stage = streakStage(streak);
  const nextStage = streak < 7 ? 'Morning' : streak < 30 ? 'Noon' : streak < 100 ? 'Corona' : null;
  const nextDayCount = streak < 7 ? 7 : streak < 30 ? 30 : streak < 100 ? 100 : null;
  const step = streak < 30 ? 7 : 10;
  // Fractions of a clockwise turn from the top; the top itself is a tick too.
  const ticks = nextDayCount === null ? [] : Array.from({ length: Math.ceil(nextDayCount / step) }, (_, index) => index * step / nextDayCount);
  return { stage, nextStage, nextDayCount, ratio: nextDayCount === null ? 1 : streak / nextDayCount, ticks };
}

export function sunRays(today: string, days: readonly KeptDay[]) {
  return weekDays(today, days).reverse().map((day, index) => ({
    ...day, state: day.state === 'today' ? 'notYet' as const : day.state, angle: index * 360 / 7,
  }));
}

export function buildSunModel(progress: Progress, content: Content, now: Date, learnerId = localLearnerId) {
  const today = buildTodayModel(progress, content, now, learnerId);
  const quests = progress.questDone.filter(row => row.learnerId === learnerId);
  const days = progress.activityDays.filter(row => row.learnerId === learnerId && row.dayDate <= today.dayDate).map(day => ({
    ...day, questsDone: questsDoneOn(quests, day.dayDate),
  }));
  const ring = streakProgress(today.streak);
  const sentence = today.streak === 0 ? 'Every sun begins at dawn.'
    : ring.stage === 'dawn' ? 'A dawn sun. Morning begins at day 7.'
    : ring.stage === 'morning' ? 'A morning sun. Noon begins at day 30.'
    : ring.stage === 'noon' ? 'A noon sun. Corona begins at day 100.' : 'A corona sun, at its fullest.';
  const description = `Your sun: a streak of ${today.streak} days. Seven rays show the last seven days. ${ring.nextDayCount === null
    ? 'The outer ring is full in Corona.' : `The outer ring shows ${today.streak} of ${ring.nextDayCount} days toward ${ring.nextStage}.`}`;
  return {
    streak: today.streak, reduceMotion: today.reduceMotion, freezesLeft: today.freezesLeft,
    longest: longestStreak(days), ring, rays: sunRays(today.dayDate, days), sentence, description,
    speech: glauxLine(content, today.streak === 0 ? 'sunBegin' : today.status === 'atRisk' ? 'sunReturn' : 'sunGrowing', { days: today.streak }),
  };
}

export type SunModel = ReturnType<typeof buildSunModel>;
