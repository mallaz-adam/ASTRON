import { Link } from 'react-router-dom';
import { Page } from '../design/Page';
import { QuestRow } from '../design/QuestRow';
import type { TodayModel } from '../logic/today';
import { StreakCard } from './StreakCard';
import { TodayHeader } from './TodayHeader';
import { TodayTabs } from './TodayTabs';
import './Today.css';

export function TodayView({ model, showDevLink = false }: { model: TodayModel; showDevLink?: boolean }) {
  return (
    <Page className="today-page" reduceMotion={model.reduceMotion} skipLabel="Today">
      <main id="main-content" className="today-main" tabIndex={-1}>
        <TodayHeader weekday={model.weekday} />
        <StreakCard model={model} />
        <p className="daily-quests-label">{model.questHeading}</p>
        <div className="today-goal">
          <span className="goal-diamonds" aria-hidden="true">
            {model.diamonds.map((filled, index) => <span key={index} className={`goal-diamond ${filled ? 'goal-diamond--filled' : ''}`} />)}
          </span>
          <p>{model.goalText}</p>
        </div>
        <div className="today-quests">
          {model.questRows.map(quest => <QuestRow key={quest.id} kind={quest.kind} title={quest.title} xp={quest.xp} done={quest.done} />)}
        </div>
        <p className="today-bonus">{model.bonusText}</p>
        {showDevLink && <Link className="today-dev-link" to="/dev">/dev</Link>}
        <TodayTabs />
      </main>
    </Page>
  );
}
