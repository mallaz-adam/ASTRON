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
        {model.currentCellTitle && <ActionLink variant="primary" className="today-continue" to="/learn"><span>Continue learning</span><span className="today-next-title">{model.currentCellTitle}</span></ActionLink>}
        <StreakCard model={model} />
        <p className="daily-quests-label">{model.questHeading}</p>
        <div className="today-goal">
          <span className="goal-diamonds" aria-hidden="true">
            {model.diamonds.map((filled, index) => <span key={index} className={`goal-diamond ${filled ? 'goal-diamond--filled' : ''}`} />)}
          </span>
          <p>{model.goalText}</p>
        </div>
        <div className="today-quests">
          {model.questRows.map(quest => <Link key={quest.id} className="today-quest-link" to={quest.kind === 'Learn' ? '/learn' : quest.kind === 'Read' ? '/articles' : '/stories'}><QuestRow kind={quest.kind} title={quest.title} xp={quest.xp} done={quest.done} /></Link>)}
        </div>
        <p className="today-bonus">Finish all three today for <span className="lining-figures">+10 XP</span>.</p>
        <aside className="today-discovery-link" aria-label="Keep exploring"><ActionLink to="/articles/betelgeuse-colour">Why does Betelgeuse look red?</ActionLink><ActionLink to="/sky">My sky</ActionLink></aside>
        {showDevLink && <Link className="today-dev-link" to="/dev">/dev</Link>}
        {!desktop && <TodayTabs />}
        <TestTools />
      </main>
    </Page>
  );
}
