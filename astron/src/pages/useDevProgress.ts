import { useEffect, useRef, useState } from 'react';
import { db } from '../data/db';
import { loadContent } from '../data/contentLoader';
import type { Content, DailyGoal, Progress } from '../data/types';
import { changeDailyGoal, completeCell, completeQuest, eraseProgress, exportProgress, markArticleRead, openDay, readProgress } from '../data/services';
import { addDays, atLocalNoon, localDate } from '../logic/dates';

export const devLearnerId = 'local-learner';

export function useDevProgress() {
  // Only this page owns the pretend clock. Reload starts at the real local date.
  const [now, setNow] = useState(() => new Date());
  const [content, setContent] = useState<Content>();
  const [progress, setProgress] = useState<Progress>();
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('Ready for a small experiment.');
  const locked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const loaded = await loadContent();
        await openDay(db, devLearnerId, now);
        const saved = await readProgress(db);
        if (!cancelled) { setContent(loaded); setProgress(saved); setBusy(false); }
      } catch (problem) {
        if (!cancelled) { setError(describeError(problem)); setBusy(false); }
      }
    }
    void start();
    return () => { cancelled = true; };
    // The initial date is intentionally captured once, not after each Next day.
  }, []);

  async function run(action: () => Promise<unknown>, success: string) {
    if (locked.current || busy) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
      setProgress(await readProgress(db));
      setMessage(success);
    } catch (problem) { setError(describeError(problem)); }
    finally { setBusy(false); locked.current = false; }
  }

  function learn() {
    if (!content) return;
    const cell = content.cells.find(row => row.kind === 'lesson');
    if (!cell) { setError('The sample content needs a lesson cell.'); return; }
    void run(() => completeCell(db, content, devLearnerId, cell.id, now), 'Learn recorded. Repeat presses give no extra daily XP.');
  }

  function discover() {
    if (!content) return;
    void run(() => completeQuest(db, content, devLearnerId, 'story', now), 'Discover recorded for this day.');
  }

  function read() {
    if (!content) return;
    const article = content.articles[0];
    if (!article) { setError('The sample content needs an article.'); return; }
    void run(() => markArticleRead(db, content, devLearnerId, article.id, now), 'Read recorded for this day.');
  }

  function nextDay() {
    const next = atLocalNoon(addDays(localDate(now), 1));
    void run(async () => { await openDay(db, devLearnerId, next); setNow(next); }, 'Moved forward one pretend day. Earlier days were closed.');
  }

  function goal(dailyGoal: DailyGoal) {
    void run(() => changeDailyGoal(db, devLearnerId, dailyGoal, now), 'Today’s goal changed. Past days keep their saved goal.');
  }

  function erase() {
    void run(() => eraseProgress(db), 'All eight progress tables are empty. The next action starts fresh.');
  }

  function download() {
    void run(async () => {
      const json = await exportProgress(db);
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'astron-progress.json';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'Downloaded the progress tables. Content was not included.');
  }

  return { now, content, progress, busy, error, message, learn, discover, read, nextDay, goal, erase, download };
}

function describeError(problem: unknown) {
  return problem instanceof Error ? problem.message : 'Could not save progress. Check that this browser allows on-device storage.';
}
