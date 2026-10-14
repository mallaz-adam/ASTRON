import { Link } from 'react-router-dom';
import { Page } from '../design/Page';
import { buildSunModel } from '../logic/sun';
import { useToday } from './useToday';
import { YourSunView } from './YourSunView';

export function YourSun() {
  const { model, progress, content, now, error } = useToday();
  if (model && progress && content) return <YourSunView model={buildSunModel(progress, content, now)} />;
  return <Page className="sun-page" skipLabel="Your sun"><main id="main-content" tabIndex={-1} aria-busy={!error}>
    <Link className="sun-back" to="/">Back to Today</Link><h1>Your sun</h1>{error && <p role="alert">{error}</p>}
  </main></Page>;
}
