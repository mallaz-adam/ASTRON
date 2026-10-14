import { NavLink } from 'react-router-dom';
import { ProfileButton } from './ProfileButton';

const tabs = [
  { label: 'Learn', path: 'M4 4h6l2 2 2-2h6v16h-6l-2 2-2-2H4zM12 6v16' },
  { label: 'Stories', path: 'M6 3h12v18H6zM9 7h6M9 11h6M9 15h4' },
  { label: 'Timeline', path: 'M12 3v18M5 6h7M12 12h7M5 18h7M4 5h2v2H4zM18 11h2v2h-2zM4 17h2v2H4z' },
  { label: 'Journal', path: 'M5 3h14v18H5zM8 7h7M8 11h7M8 15h5M3 6h4M3 12h4M3 18h4' },
];

export function TodayTabs() {
  return (
    <div className="navigation-bar">
      <span className="navigation-wordmark">ASTRON</span>
      <nav className="today-tabs" aria-label="Learn, Stories, Timeline, Journal">
      {tabs.map((tab, index) => {
        const contents = <><svg viewBox="0 0 24 24" aria-hidden="true"><path d={tab.path} /></svg><span>{tab.label}</span></>;
        return index === 0
          ? <NavLink key={tab.label} className="today-tab today-tab--active" to="/" end>{contents}</NavLink>
          : <button key={tab.label} className="today-tab" type="button" disabled aria-disabled="true">{contents}</button>;
      })}
      </nav>
      <ProfileButton className="navigation-profile" />
    </div>
  );
}
