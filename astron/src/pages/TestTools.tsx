import { useRef, useState } from 'react';
import { db } from '../data/db';
import { eraseProgress } from '../data/services';
import { confirmProgressErasure } from '../logic/testTools';
import { temporaryProgress } from '../data/progressMode';

export function TestTools() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  async function erase() {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError('');
    try { await confirmProgressErasure(() => window.confirm('Erase my progress on this device?'), () => eraseProgress(db)); }
    catch (problem) { setError(problem instanceof Error ? problem.message : String(problem)); }
    finally { saving.current = false; setBusy(false); }
  }
  return <footer className="today-test-tools">
    <p className="test-version">Test version 0.1</p>
    {temporaryProgress ? <><p>Development preview. Progress resets when you reopen or refresh.</p><a className="article-open" href="/start">Start from the beginning</a></> : <button type="button" className="test-erase" onClick={() => void erase()} disabled={busy}>Erase my progress on this device</button>}
    {error && <p role="alert">{error}</p>}
  </footer>;
}
