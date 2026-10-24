import { useEffect, useState } from 'react';
import { Button } from '../design/Button';
import { observeUpdates } from './updates';
import './UpdateNotice.css';

export function UpdateNoticeView({ refresh }: { refresh?: () => void }) {
  if (!refresh) return null;
  return <aside className="update-notice" aria-live="polite">
    <p>A new version is ready.</p><Button onClick={refresh}>REFRESH</Button>
  </aside>;
}

export function UpdateNotice() {
  const [refresh, setRefresh] = useState<() => void>();
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    let mounted = true;
    let subscription: Awaited<ReturnType<typeof observeUpdates>> | undefined;
    void observeUpdates(navigator.serviceWorker, action => { if (mounted) setRefresh(() => action); }, () => window.location.reload())
      .then(value => { if (mounted) subscription = value; else value.dispose(); })
      .catch(() => {}); // An offline visit keeps using the installed worker.
    const check = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) void subscription?.check();
    };
    window.addEventListener('focus', check);
    window.addEventListener('online', check);
    document.addEventListener('visibilitychange', check);
    const interval = window.setInterval(check, 60_000);
    return () => {
      mounted = false;
      subscription?.dispose();
      window.clearInterval(interval);
      window.removeEventListener('focus', check);
      window.removeEventListener('online', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
  return <UpdateNoticeView refresh={refresh} />;
}
