export function TodayHeader({ weekday }: { weekday: string }) {
  return (
    <header className="today-header">
      <div><p className="today-weekday">{weekday}</p><h1>Today</h1></div>
      <button type="button" className="profile-control" aria-label="Profile">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path d="M5 21v-3a7 7 0 0 1 14 0v3" /></svg>
      </button>
    </header>
  );
}
