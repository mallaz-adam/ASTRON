import type { Learner } from './types';

export const localLearnerId = 'local-learner';

export function defaultLearner(id: string): Learner {
  return { id, displayName: 'Sky learner', dailyGoal: 2, language: 'en', reduceMotion: false, freezesLeft: 1 };
}
