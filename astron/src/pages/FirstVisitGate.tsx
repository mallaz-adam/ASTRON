import { Navigate, Outlet } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { needsWelcome } from '../logic/taleJourney';
import { Page } from '../design/Page';

export function FirstVisitGate() {
  const { progress, error } = useProgress();
  if (!progress) return <Page skipLabel="Skip to the atlas"><main id="main-content" aria-busy={!error}><h1>Opening the atlas…</h1>{error && <p role="alert">{error}</p>}</main></Page>;
  return needsWelcome(progress) ? <Navigate to="/welcome" replace /> : <Outlet />;
}
