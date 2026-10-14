import { ProfileButton } from './ProfileButton';

export function TodayHeader({ weekday }: { weekday: string }) {
  return (
    <header className="today-header">
      <div><p className="today-weekday">{weekday}</p><h1>Today</h1></div>
      <ProfileButton />
    </header>
  );
}
