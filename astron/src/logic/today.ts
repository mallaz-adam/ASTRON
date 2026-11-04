import type { Content, Progress, QuestKind } from '../data/types';
import { defaultLearner, localLearnerId } from '../data/learner';
import { localDate } from './dates';
import { goalMet, questsDoneOn, sunStage } from './quests';
import { computeStreak, streakStage } from './streak';
import { weekDays } from './week';
import { buildCoursePath } from './coursePath';
import { glauxLine } from './glauxVoice';

const questOrder: QuestKind[] = ['learn', 'read', 'story'];
const labels = { learn: 'Learn', read: 'Read', story: 'Stories' };
const instructions = {
  learn: "Finish a lesson or collect a story's star.",
  read: 'Open an article, then choose Mark as read.',
  story: 'Read a story, then collect its star.',
};
const destinations = { learn: '/learn', read: '/articles', story: '/stories' };

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
    const matches = record ? progress.completions.filter(row => row.learnerId === learnerId && row.completedOn === record.doneOn &&
      content.cells.some(cell => cell.id === row.cellId && (kind !== 'story' || cell.kind === 'tale')))
      : [];
    const completion = matches.length === 1 ? matches[0] : undefined;
    const cellTitle = completion && content.cells.find(cell => cell.id === completion.cellId)?.title;
    const reads = record && kind === 'read' ? progress.articleReads.filter(row => row.learnerId === learnerId && row.readOn === record.doneOn) : [];
    const read = reads.length === 1 ? reads[0] : undefined;
    const sourceTitle = kind === 'read' ? read && content.articles.find(article => article.id === read.articleId)?.title : cellTitle;
    return { id: quest.id, kind: labels[kind], title: quest.title, xp: quest.xpReward, done: Boolean(record), earned: record?.xpEarned ?? 0,
      instruction: instructions[kind], to: destinations[kind], completionText: sourceTitle ? `Completed: ${sourceTitle}` : 'Done today' };
  });
  const done = questRows.filter(row => row.done).length;
  const met = goalMet(done, dailyGoal);
  const streak = computeStreak(dayDate, days, dailyGoal);
  const remaining = Math.max(0, dailyGoal - done);
  const questWord = remaining === 1 ? 'activity' : 'activities';
  const streakText = glauxLine(content, met ? 'todayKept' : streak === 0 ? 'todayBegin' : 'todayContinue', { remaining, questWord });
  const week = weekDays(dayDate, days);
  const xpEarned = questRows.reduce((sum, row) => sum + row.earned, 0);
  const xpAvailable = questRows.reduce((sum, row) => sum + row.xp, 0);
  const path = buildCoursePath(content, progress, learnerId, undefined, true);
  return {
    dayDate, weekday: new Intl.DateTimeFormat('en', { weekday: 'long' }).format(now),
    sunStage: sunStage(done), streak, streakStage: streakStage(streak),
    status: met ? 'kept' : streak > 0 ? 'atRisk' : 'none',
    freezesLeft: learner.freezesLeft, freezeText: `${learner.freezesLeft} freeze${learner.freezesLeft === 1 ? '' : 's'}`,
    reduceMotion: learner.reduceMotion, dailyGoal, questsDone: done,
    streakText, week, questRows, xpEarned, xpAvailable,
    questHeading: `DAILY ACTIVITIES · ${xpEarned} / ${xpAvailable} XP`,
    diamonds: Array.from({ length: dailyGoal }, (_, index) => index < done),
    goalText: met ? 'Daily goal met.' : `${Math.min(done, dailyGoal)} of ${dailyGoal} daily activities complete`,
    bonusText: 'Finish all three today for +10 XP.',
    currentCellTitle: path.current?.title ?? null,
    currentCellTo: path.current ? `/cell/${path.current.id}` : '/learn',
    learningAction: path.current ? 'Continue learning' : 'Explore the learning path',
  };
}

export type TodayModel = ReturnType<typeof buildTodayModel>;
