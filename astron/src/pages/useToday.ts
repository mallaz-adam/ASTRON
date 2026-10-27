import { useEffect, useState } from 'react';
import { db } from '../data/db';
import { getContent } from '../data/sharedContent';
import { localLearnerId } from '../data/learner';
import { openDay } from '../data/services';
import type { Content } from '../data/types';
import { useProgress } from '../hooks/useProgress';
import { useDeviceClock } from '../hooks/useDeviceClock';
import { localDate } from '../logic/dates';
import { buildTodayModel } from '../logic/today';

export function useToday() {
  const now = useDeviceClock();
  const dayDate = localDate(now);
  const { progress, error: storageError } = useProgress();
  const [content, setContent] = useState<Content>();
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const hasLearner = Boolean(progress?.learners.some(row => row.id === localLearnerId));

  useEffect(() => {
    let active = true;
    void getContent().then(value => { if (active) setContent(value); }).catch(problem => { if (active) setError(String(problem.message)); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    setReady(false);
    void openDay(db, localLearnerId, now).then(() => { if (active) setReady(true); }).catch(problem => { if (active) setError(String(problem.message)); });
    return () => { active = false; };
    // A new date closes past days. Erasing a learner starts a fresh local profile.
  }, [dayDate, hasLearner]);

  const model = ready && content && progress ? buildTodayModel(progress, content, now) : undefined;
  return { model, progress, content, now, weekday: new Intl.DateTimeFormat('en', { weekday: 'long' }).format(now), error: error || storageError };
}
