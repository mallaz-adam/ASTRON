import { Link } from 'react-router-dom';
import { Page } from '../design/Page';
import { QuestRow } from '../design/QuestRow';
import type { TodayModel } from '../logic/today';
import { useDesktopLayout } from '../hooks/useDesktopLayout';
import { StreakCard } from './StreakCard';
import { TodayHeader } from './TodayHeader';
import { TodayTabs } from './TodayTabs';
import { TestTools } from './TestTools';
import { ActionLink } from '../design/ActionLink';
import './Today.css';
import './AtlasReaders.css';

export function TodayView({ model, showDevLink = false }: { model: TodayModel; showDevLink?: boolean }) {
  const desktop = useDesktopLayout();
  return (
    <Page className="today-page" reduceMotion={model.reduceMotion} skipLabel="Today">
      <main id="main-content" className="today-main" tabIndex={-1}>
        {desktop && <TodayTabs />}
        <TodayHeader weekday={model.weekday} />
        <ActionLink variant="primary" className="today-continue" to={model.currentCellTo}><span>{model.learningAction}</span>{model.currentCellTitle && <span className="today-next-title">{model.currentCellTitle}</span>}</ActionLink>
        <section className="today-activities" aria-labelledby="today-activities-title">
        <h2 id="today-activities-title">Today's activities</h2>
        <div className="today-goal">
          <span className="goal-diamonds" aria-hidden="true">
            {model.diamonds.map((filled, index) => <span key={index} className={`goal-diamond ${filled ? 'goal-diamond--filled' : ''}`} />)}
          </span>
          <p>{model.goalText}</p>
        </div>
        <div className="today-quests">
          {model.questRows.map(quest => <Link key={quest.id} className="today-quest-link" to={quest.to}><QuestRow kind={quest.kind} title={quest.title} xp={quest.xp} done={quest.done} description={quest.instruction} statusText={quest.done ? quest.completionText : 'Not yet'} showXp={false} /></Link>)}
        </div>
        <p className="today-rules-note">Stories also count towards Learn. Each activity counts once per day.</p>
        <details className="today-rewards"><summary>Daily goal and XP</summary><div><p>{model.questHeading}</p><p>{model.bonusText}</p><p>Complete {model.dailyGoal} {model.dailyGoal === 1 ? 'activity' : 'activities'} to meet your daily goal. Consecutive days meeting your goal form your streak.</p><p>A freeze can protect one missed day. See Your sun for the details.</p></div></details>
        </section>
        <StreakCard model={model} />
        <aside className="today-discovery-link" aria-label="Keep exploring"><ActionLink to="/articles/betelgeuse-colour">Why does Betelgeuse look red?</ActionLink><ActionLink to="/sky">My sky</ActionLink></aside>
        {showDevLink && <Link className="today-dev-link" to="/dev">/dev</Link>}
        {!desktop && <TodayTabs />}
        <TestTools />
      </main>
    </Page>
  );
}
