export const introTimings = { revealing: 1500, waving: 2200, entering: 1200 };
export type IntroPhase = 'waiting' | keyof typeof introTimings | 'finished';
type IntroEvent = { type: 'ready'; reduceMotion: boolean } | { type: 'advance' } | { type: 'finish' };

// A completed introduction never restarts when progress or the route changes.
export function introPhase(phase: IntroPhase, event: IntroEvent): IntroPhase {
  if (phase === 'finished' || event.type === 'finish') return 'finished';
  if (event.type === 'ready') {
    if (event.reduceMotion) return 'finished';
    return phase === 'waiting' ? 'revealing' : phase;
  }
  return { waiting: 'waiting', revealing: 'waving', waving: 'entering', entering: 'finished' }[phase] as IntroPhase;
}
