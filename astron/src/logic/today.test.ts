import { afterEach, describe, expect, it, vi } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { defaultLearner, localLearnerId } from '../data/learner';
import type { DailyGoal, Progress, QuestKind } from '../data/types';
import { addDays, atLocalNoon } from './dates';
import { buildTodayModel } from './today';

const content = sampleContent();
const date = '2026-10-13';
const now = atLocalNoon(date);
afterEach(() => vi.unstubAllEnvs());

function progress(done: QuestKind[] = [], goal: DailyGoal = 2, priorDays = 0): Progress {
  const result: Progress = {
    learners: [{ ...defaultLearner(localLearnerId), dailyGoal: goal }],
    learnerInterests: [], activityDays: [], questDone: [], completions: [], answers: [], litStars: [], articleReads: [],
  };
  for (let offset = -priorDays; offset <= 0; offset++) {
    const dayDate = addDays(date, offset);
    result.activityDays.push({ learnerId: localLearnerId, dayDate, dailyGoal: goal, freezeUsed: false });
    const kinds = offset === 0 ? done : content.quests.slice(0, goal).map(quest => quest.kind);
    for (const kind of kinds) {
      const quest = content.quests.find(row => row.kind === kind)!;
      result.questDone.push({ learnerId: localLearnerId, dayDate, questId: quest.id, doneOn: atLocalNoon(dayDate).toISOString(), xpEarned: quest.xpReward });
    }
  }
  return result;
}

describe('Today messages and progress', () => {
  it.each([1, 2, 3] as const)('starts a streak with the exact goal-%s text', goal => {
    const model = buildTodayModel(progress([], goal), content, now);
    expect(model.streak).toBe(0);
    expect(model.status).toBe('none');
    expect(model.streakText).toBe(`Begin with ${goal} ${goal === 1 ? 'activity' : 'activities'} today. The atlas grows one discovery at a time.`);
  });
  it('asks only for the remaining quest when starting a streak', () => {
    const model = buildTodayModel(progress(['learn']), content, now);
    expect(model.streakText).toBe('Begin with 1 activity today. The atlas grows one discovery at a time.');
    expect(model.goalText).toBe('1 of 2 daily activities complete');
  });
  it('shows an at-risk thirteen-day streak and its next target', () => {
    const model = buildTodayModel(progress([], 2, 13), content, now);
    expect(model.streak).toBe(13);
    expect(model.status).toBe('atRisk');
    expect(model.streakText).toBe('Finish 2 more activities today to keep your sun alight.');
  });
  it('uses singular quest when one more is needed to keep the streak', () => {
    const model = buildTodayModel(progress(['learn'], 2, 13), content, now);
    expect(model.streakText).toBe('Finish 1 more activity today to keep your sun alight.');
  });
  it.each([1, 2, 3] as const)('shows the safe text when goal %s is met', goal => {
    const model = buildTodayModel(progress(content.quests.slice(0, goal).map(row => row.kind), goal, 13), content, now);
    expect(model.status).toBe('kept');
    expect(model.streak).toBe(14);
    expect(model.streakText).toBe("Your sun is safe tonight. Let today's discoveries settle.");
    expect(model.goalText).toBe('Daily goal met.');
  });
  it('orders rows Learn, Read, Discover and marks only today’s matching quest', () => {
    const model = buildTodayModel(progress(['learn'], 2, 2), content, now);
    expect(model.questRows.map(row => row.kind)).toEqual(['Learn', 'Read', 'Stories']);
    expect(model.questRows.map(row => row.done)).toEqual([true, false, false]);
    expect(model.sunStage).toBe(1);
    expect(model.questHeading).toBe('DAILY ACTIVITIES · 20 / 45 XP');
    expect(model.diamonds).toEqual([true, false]);
  });
  it('shows stage two and a met Steady goal for two quests', () => {
    const model = buildTodayModel(progress(['learn', 'story']), content, now);
    expect(model.sunStage).toBe(2);
    expect(model.goalText).toBe('Daily goal met.');
  });
  it('caps the goal diamonds and shows 45/45 quest XP separately from the bonus', () => {
    const saved = progress(['learn', 'story', 'read']);
    saved.completions.push({ learnerId: localLearnerId, cellId: 'example', completedOn: now.toISOString(), correctAnswers: 0, xpEarned: 100 });
    const model = buildTodayModel(saved, content, now);
    expect(model.sunStage).toBe(3);
    expect(model.questHeading).toBe('DAILY ACTIVITIES · 45 / 45 XP');
    expect(model.bonusText).toBe('Finish all three today for +10 XP.');
    expect(model.diamonds).toEqual([true, true]);
  });
  it('does not double-count duplicate quest records in the screen model', () => {
    const saved = progress(['learn']); saved.questDone.push({ ...saved.questDone[0] });
    expect(buildTodayModel(saved, content, now).xpEarned).toBe(20);
    expect(buildTodayModel(saved, content, now).sunStage).toBe(1);
  });
  it('does not read another learner’s progress', () => {
    const saved = progress();
    saved.questDone.push(...progress(['learn', 'read', 'story']).questDone.map(row => ({ ...row, learnerId: 'other' })));
    expect(buildTodayModel(saved, content, now).questsDone).toBe(0);
  });
  it('preserves saved motion and freeze settings', () => {
    const saved = progress(); saved.learners[0].reduceMotion = true; saved.learners[0].freezesLeft = 0;
    const model = buildTodayModel(saved, content, now);
    expect(model.reduceMotion).toBe(true);
    expect(model.freezeText).toBe('0 freezes');
  });
  it('gives a new learner one freeze without mutating any input', () => {
    const saved = progress(); saved.learners = [];
    const before = structuredClone(saved);
    expect(buildTodayModel(saved, content, now).freezeText).toBe('1 freeze');
    expect(saved).toEqual(before);
  });
  it('opens the next authored lesson directly, then falls back to the path when all ready units are complete', () => {
    const saved = progress();
    expect(buildTodayModel(saved, content, now).currentCellTo).toBe('/cell/earth-sun-moon');
    saved.completions.push({ learnerId: localLearnerId, cellId: 'earth-sun-moon', completedOn: now.toISOString(), correctAnswers: 0, xpEarned: 0 });
    expect(buildTodayModel(saved, content, now).currentCellTo).toBe('/cell/our-solar-system');
    for (const cellId of ['our-solar-system', 'stars-milky-way', 'galaxies-universe']) saved.completions.push({ learnerId: localLearnerId, cellId, completedOn: now.toISOString(), correctAnswers: 0, xpEarned: 0 });
    expect(buildTodayModel(saved, content, now)).toMatchObject({ currentCellTo: '/learn', currentCellTitle: null, learningAction: 'Explore the learning path' });
  });
  it('explains both daily credits from a story using the matching saved completion', () => {
    const saved = progress(['learn', 'story']);
    const story = content.cells.find(cell => cell.kind === 'tale' && cell.taleId === 'orion-shoulder')!;
    saved.completions.push({ learnerId: localLearnerId, cellId: story.id, completedOn: now.toISOString(), correctAnswers: 0, xpEarned: 0 });
    const model = buildTodayModel(saved, content, now);
    expect(model.questRows[0].completionText).toBe(`Completed: ${story.title}`);
    expect(model.questRows[2].completionText).toBe(`Completed: ${story.title}`);
    expect(model.questRows[0].instruction).toContain("story's star");
    expect(model.questRows[1].instruction).toContain('Mark as read');
    expect(model.questRows.map(row => row.to)).toEqual(['/learn', '/articles', '/stories']);
  });
  it('does not invent a completion source for a replay or ambiguous timestamps', () => {
    const saved = progress(['learn']);
    expect(buildTodayModel(saved, content, now).questRows[0].completionText).toBe('Done today');
    for (const cellId of ['earth-sun-moon', 'our-solar-system']) saved.completions.push({ learnerId: localLearnerId, cellId, completedOn: now.toISOString(), correctAnswers: 0, xpEarned: 0 });
    expect(buildTodayModel(saved, content, now).questRows[0].completionText).toBe('Done today');
  });
});

describe('Today’s seven calendar days', () => {
  it('ends today and distinguishes kept, missed, and today’s ring', () => {
    const model = buildTodayModel(progress([], 2, 2), content, now);
    expect(model.week.map(day => day.dayDate)).toEqual(['2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13']);
    expect(model.week.map(day => day.state)).toEqual(['missed', 'missed', 'missed', 'missed', 'kept', 'kept', 'today']);
    expect(model.week.map(day => day.initial)).toEqual(['W', 'T', 'F', 'S', 'S', 'M', 'T']);
    expect(model.week.filter(day => day.isToday)).toHaveLength(1);
  });
  it('shows a checked circle for today when its goal is met', () => {
    expect(buildTodayModel(progress(['learn', 'read']), content, now).week.at(-1)?.state).toBe('kept');
  });
  it('shows a frozen past day as kept using its saved goal', () => {
    const saved = progress([], 2, 2);
    saved.questDone = saved.questDone.filter(row => row.dayDate !== '2026-10-12');
    saved.activityDays.find(day => day.dayDate === '2026-10-12')!.freezeUsed = true;
    const model = buildTodayModel(saved, content, now);
    expect(model.week.at(-2)?.state).toBe('kept');
    expect(model.streak).toBe(2);
  });
  it('uses the new local date after a device time-zone change, preserving history', () => {
    const saved = progress(['learn', 'story'], 2, 2);
    const instant = new Date('2026-10-14T02:30:00Z');
    vi.stubEnv('TZ', 'America/New_York');
    const before = buildTodayModel(saved, content, instant);
    vi.stubEnv('TZ', 'Asia/Tokyo');
    const after = buildTodayModel(saved, content, instant);
    expect(before.dayDate).toBe('2026-10-13');
    expect(after.dayDate).toBe('2026-10-14');
    expect(after.week.at(-1)?.dayDate).toBe('2026-10-14');
    expect(after.streak).toBe(before.streak);
    expect(after.sunStage).toBe(0);
  });
});
