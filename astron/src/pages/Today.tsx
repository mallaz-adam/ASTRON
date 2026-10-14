import { Page } from '../design/Page';
import { useToday } from './useToday';
import { TodayHeader } from './TodayHeader';
import { TodayView } from './TodayView';

export function Today() {
  const { model, weekday, error } = useToday();
  if (model) return <TodayView model={model} showDevLink={import.meta.env.DEV} />;
  return (
    <Page className="today-page" skipLabel="Today">
      <main id="main-content" className="today-main" tabIndex={-1} aria-busy={!error}>
        <TodayHeader weekday={weekday} />
        {error && <p role="alert">{error}</p>}
      </main>
    </Page>
  );
}
