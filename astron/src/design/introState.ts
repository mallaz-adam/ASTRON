export const introDurationMs = 1800;
export type IntroPhase = 'waiting' | 'waving' | 'finished';
type IntroEvent = { type: 'ready'; reduceMotion: boolean } | { type: 'finish' };

// A completed introduction never restarts when progress or the route changes.
export function introPhase(phase: IntroPhase, event: IntroEvent): IntroPhase {
  if (phase === 'finished' || event.type === 'finish') return 'finished';
  if (event.reduceMotion) return 'finished';
  return 'waving';
}
