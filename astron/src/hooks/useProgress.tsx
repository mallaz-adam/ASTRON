import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { db } from '../data/db';
import type { Progress } from '../data/types';
import { observeProgress } from '../data/observeProgress';

type SavedProgress = { progress?: Progress; error: string };
const ProgressContext = createContext<SavedProgress | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedProgress>({ error: '' });
  useEffect(() => {
    const subscription = observeProgress(db).subscribe({
      next: progress => setSaved({ progress, error: '' }),
      error: problem => setSaved({ error: String(problem instanceof Error ? problem.message : problem) }),
    });
    return () => subscription.unsubscribe();
  }, []);
  return <ProgressContext.Provider value={saved}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const saved = useContext(ProgressContext);
  if (!saved) throw new Error('ProgressProvider is missing.');
  return saved;
}
