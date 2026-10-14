import type { Content, Progress, QuestKind } from '../data/types';
import { defaultLearner, localLearnerId } from '../data/learner';
import { addDays, atLocalNoon, localDate } from './dates';
import { goalMet, questsDoneOn, sunStage } from './quests';
import { computeStreak, dayKept, streakStage } from './streak';

const questOrder: QuestKind[] = ['learn', 'read', 'story'];
const labels = { learn: 'Learn', read: 'Read', story: 'Discover' };
type WeekState = 'kept' | 'missed' | 'today';

// This function only reads its inputs. The screen supplies the real device time.
export function buildTodayModel(progress: Progress, content: Content, now: Date, learnerId = localLearnerId) {
  const dayDate = localDate(now);
  const learner = progress.learners.find(row => row.id === learnerId) ?? defaultLearner(learnerId);
  const quests = progress.questDone.filter(row => row.learnerId === learnerId);
  const days = progress.activityDays.filter(row => row.learnerId === learnerId).map(day => ({
    ...day, questsDone: questsDoneOn(quests, day.dayDate),
  }));
  const today = days.find(day => day.dayDate === dayDate);
  const dailyGoal = today?.dailyGoal ?? learner.dailyGoal;
  const questRows = questOrder.map(kind => {
    const quest = content.quests.find(row => row.kind === kind);
    if (!quest) throw new Error(`quests.json: kind — missing ${kind} quest.`);
    const record = quests.find(row => row.dayDate === dayDate && row.questId === quest.id);
    return { id: quest.id, kind: labels[kind], title: quest.title, xp: quest.xpReward, done: Boolean(record), earned: record?.xpEarned ?? 0 };
  });
  const done = questRows.filter(row => row.done).length;
  const met = goalMet(done, dailyGoal);
  const streak = computeStreak(dayDate, days, dailyGoal);
  const remaining = Math.max(0, dailyGoal - done);
  const questWord = remaining === 1 ? 'quest' : 'quests';
  const streakText = met ? 'Your sun is safe tonight.' : streak === 0
    ? `Finish ${remaining} ${questWord} today to begin your streak.`
    : `Finish ${remaining} more ${questWord} today to make it ${streak + 1}.`;
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(dayDate, index - 6);
    const saved = days.find(day => day.dayDate === date);
    const kept = saved ? dayKept(saved) : false;
    const isToday = date === dayDate;
    const state: WeekState = kept ? 'kept' : isToday ? 'today' : 'missed';
    const weekday = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(atLocalNoon(date));
    return { dayDate: date, weekday, initial: weekday[0], state, isToday, freezeUsed: saved?.freezeUsed ?? false };
  });
  const xpEarned = questRows.reduce((sum, row) => sum + row.earned, 0);
  const xpAvailable = questRows.reduce((sum, row) => sum + row.xp, 0);
  return {
    dayDate, weekday: new Intl.DateTimeFormat('en', { weekday: 'long' }).format(now),
    sunStage: sunStage(done), streak, streakStage: streakStage(streak),
    status: met ? 'kept' : streak > 0 ? 'atRisk' : 'none',
    freezesLeft: learner.freezesLeft, freezeText: `${learner.freezesLeft} freeze${learner.freezesLeft === 1 ? '' : 's'}`,
    reduceMotion: learner.reduceMotion, dailyGoal, questsDone: done,
    streakText, week, questRows, xpEarned, xpAvailable,
    questHeading: `DAILY QUESTS · ${xpEarned} / ${xpAvailable} XP`,
    diamonds: Array.from({ length: dailyGoal }, (_, index) => index < done),
    goalText: met ? 'Goal met. Your streak is safe tonight.' : `${Math.min(done, dailyGoal)} of ${dailyGoal} quests keeps your streak alive`,
    bonusText: 'Finish all three today for +10 XP.',
  };
}

export type TodayModel = ReturnType<typeof buildTodayModel>;
