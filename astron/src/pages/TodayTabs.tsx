import { NavLink } from 'react-router-dom';
import { ProfileButton } from './ProfileButton';

const tabs = [
  { label: 'Today', to: '/', path: 'M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0' },
  { label: 'Learn', to: '/learn', path: 'M4 4h6l2 2 2-2h6v16h-6l-2 2-2-2H4zM12 6v16' },
  { label: 'Stories', to: '/stories', path: 'M6 3h12v18H6zM9 7h6M9 11h6M9 15h4' },
  { label: 'Articles', to: '/articles', path: 'M5 3h14v18H5zM8 7h8M8 11h8M8 15h5' },
  { label: 'My sky', to: '/sky', path: 'm12 3 2.6 5.6 6.1.7-4.5 4.3 1.2 6.1-5.4-3-5.4 3 1.2-6.1L3.3 9.3l6.1-.7Z' },
];

export function NavigationIcon({ label }: { label: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={tabs.find(tab => tab.label === label)?.path} /></svg>;
}

export function TodayTabs() {
  return (
    <div className="navigation-bar">
      <span className="navigation-wordmark">ASTRON</span>
      <nav className="today-tabs" aria-label="Main navigation">
      {tabs.map(tab => {
        return <NavLink key={tab.label} className={({ isActive }) => `today-tab${isActive ? ' today-tab--active' : ''}`} to={tab.to} end={tab.to === '/'}><NavigationIcon label={tab.label} /><span>{tab.label}</span></NavLink>;
      })}
      </nav>
      <ProfileButton className="navigation-profile" />
    </div>
  );
}
