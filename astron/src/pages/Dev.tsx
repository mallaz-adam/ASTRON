import { Page } from '../design/Page';
import { Button } from '../design/Button';
import { Chip } from '../design/Chip';
import { SpeechBox } from '../design/SpeechBox';
import { QuestRow } from '../design/QuestRow';
import { ProgressSegments } from '../design/ProgressSegments';
import type { DailyGoal } from '../data/types';
import { defaultLearner, toRuleDays } from '../data/services';
import { localDate } from '../logic/dates';
import { goalMet, questsDoneOn, sunStage } from '../logic/quests';
import { computeStreak, streakStage } from '../logic/streak';
import { totalXp } from '../logic/xp';
import { DevSun } from './DevSun';
import { devLearnerId, useDevProgress } from './useDevProgress';
import './Dev.css';

const goals: { value: DailyGoal; label: string }[] = [
  { value: 1, label: 'Light · 1' }, { value: 2, label: 'Steady · 2' }, { value: 3, label: 'Full · 3' },
];

export function Dev() {
  const state = useDevProgress();
  const dayDate = localDate(state.now);
  const learner = state.progress?.learners.find(row => row.id === devLearnerId) ?? defaultLearner(devLearnerId);
  const questRecords = state.progress?.questDone.filter(row => row.learnerId === devLearnerId) ?? [];
  const activityDays = state.progress?.activityDays.filter(row => row.learnerId === devLearnerId) ?? [];
  const done = questsDoneOn(questRecords, dayDate);
  const stage = sunStage(done);
  const streak = computeStreak(dayDate, toRuleDays({ activityDays, questDone: questRecords }), learner.dailyGoal);
  const xp = totalXp(
    state.progress?.completions.filter(row => row.learnerId === devLearnerId) ?? [], questRecords,
    state.progress?.answers.filter(row => row.learnerId === devLearnerId) ?? [], state.content?.exercises ?? [],
  );
  const today = activityDays.find(day => day.dayDate === dayDate);
  const dailyGoal = today?.dailyGoal ?? learner.dailyGoal;
  const atRisk = streak > 0 && !goalMet(done, dailyGoal) && !today?.freezeUsed;

  return (
    <Page reduceMotion={learner.reduceMotion}>
      <main id="main-content" className="dev-sheet" tabIndex={-1}>
        <p className="dev-label">TEMPORARY · Developer check</p>
        <h1>Rules under a small sky</h1>
        <p>This is a test bench, not a learning screen.</p>
        <p><a href={import.meta.env.BASE_URL}>Return to Design check</a></p>
        <SpeechBox>The pretend date resets to your real date on reload. Saved progress stays on this device.</SpeechBox>
        <p>Pretend local date: <time dateTime={dayDate}>{dayDate}</time></p>
        {state.error && <p className="dev-error" role="alert">{state.error}</p>}
        {!state.content && !state.error && <p role="status">Reading the sample content…</p>}
        <section className="dev-summary" aria-label="Progress summary">
          <DevSun stage={stage} />
          <dl>
            <div><dt>Sun stage</dt><dd>{stage} / 3</dd></div>
            <div><dt>Streak</dt><dd>{streak} {streak === 1 ? 'day' : 'days'} · {streakStage(streak)}{atRisk ? ' · at risk today' : ''}</dd></div>
            <div><dt>Total XP</dt><dd>{xp} XP</dd></div>
            <div><dt>Freezes left</dt><dd>{learner.freezesLeft}</dd></div>
          </dl>
        </section>
        <section aria-labelledby="dev-quests">
          <h2 id="dev-quests">Today’s quests</h2>
          <div className="dev-quests">
            {state.content?.quests.map(quest => (
              <QuestRow key={quest.id} kind={quest.kind === 'story' ? 'Discover' : quest.kind} title={quest.title} xp={quest.xpReward} done={questRecords.some(row => row.dayDate === dayDate && row.questId === quest.id)} />
            ))}
          </div>
          <ProgressSegments label={`Today’s goal: ${dailyGoal} quest${dailyGoal > 1 ? 's' : ''}`} filled={Math.min(done, dailyGoal)} total={dailyGoal} />
          <p>{goalMet(done, dailyGoal) ? 'Daily goal met.' : 'Daily goal not met yet.'}</p>
          <div className="dev-actions">
            <Button disabled={state.busy || !state.content} onClick={state.learn}>Do the Learn quest</Button>
            <Button disabled={state.busy || !state.content} onClick={state.discover}>Do the Discover quest</Button>
            <Button disabled={state.busy || !state.content} onClick={state.read}>Do the Read quest</Button>
          </div>
        </section>
        <section aria-labelledby="dev-goal">
          <h2 id="dev-goal">Change daily goal</h2>
          <div className="dev-actions" role="group" aria-label="Daily goal">
            {goals.map(goal => <Chip key={goal.value} selected={dailyGoal === goal.value} disabled={state.busy} onClick={() => state.goal(goal.value)}>{goal.label}</Chip>)}
          </div>
          <p>Changes apply to today and future days. Earlier days keep their original goal.</p>
        </section>
        <div className="dev-actions">
          <Button disabled={state.busy || !state.content} onClick={state.nextDay}>Next day</Button>
          <Button variant="secondary" disabled={state.busy} onClick={state.download}>Export progress</Button>
          <Button variant="secondary" disabled={state.busy} onClick={state.erase}>Erase progress</Button>
        </div>
        <p role="status">{state.busy ? 'Saving on this device…' : state.message}</p>
        <p className="dev-note">Erase progress clears this browser’s ASTRON progress, including this test bench’s records. New learners start with zero freezes.</p>
      </main>
    </Page>
  );
}
