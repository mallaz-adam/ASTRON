import { GlauxArt, SunArt } from '../design/InlineArt';
import type { TodayModel } from '../logic/today';

export function StreakCard({ model }: { model: TodayModel }) {
  return (
    <section className="streak-card" aria-label="day streak">
      <div className="streak-top">
        <SunArt stage={model.sunStage} />
        <div className="streak-count"><span className="streak-number">{model.streak}</span><span className="streak-caption">day streak</span></div>
        <span className="freeze-tag">{model.freezeText}</span>
      </div>
      <ol className="streak-week" aria-label="Last seven days ending today">
        {model.week.map(day => (
          <li key={day.dayDate} aria-label={`${day.weekday}, ${day.dayDate}, ${day.state}`} aria-current={day.isToday ? 'date' : undefined}>
            <span className={`week-circle week-circle--${day.state}`} aria-hidden="true">{day.state === 'kept' ? '✓' : ''}</span>
            <span className="week-initial" aria-hidden="true">{day.initial}</span>
          </li>
        ))}
      </ol>
      <div className="streak-message"><GlauxArt /><p role="status">{model.streakText}</p></div>
    </section>
  );
}
