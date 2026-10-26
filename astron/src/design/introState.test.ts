import { describe, expect, it } from 'vitest';
import { introPhase, introTimings, type IntroPhase } from './introState';

describe('The opening greeting', () => {
  it('starts the greeting only after preferences are available', () => {
    expect(introPhase('waiting', { type: 'ready', reduceMotion: false })).toBe('revealing');
    expect(introPhase('waiting', { type: 'advance' })).toBe('waiting');
  });
  it('reveals the name before the wave, then zooms into the app', () => {
    let phase: IntroPhase = introPhase('waiting', { type: 'ready', reduceMotion: false });
    const stages = [phase];
    for (let step = 0; step < 3; step++) { phase = introPhase(phase, { type: 'advance' }); stages.push(phase); }
    expect(stages).toEqual(['revealing', 'waving', 'entering', 'finished']);
    expect(introTimings.revealing).toBeGreaterThanOrEqual(1200);
    expect(Object.values(introTimings).reduce((sum, duration) => sum + duration, 0)).toBeLessThanOrEqual(5000);
  });
  it('does not restart a stage when a live progress update arrives', () => {
    for (const phase of ['revealing', 'waving', 'entering'] as const) {
      expect(introPhase(phase, { type: 'ready', reduceMotion: false })).toBe(phase);
    }
  });
  it('skips the greeting for reduced motion, including a change while waving', () => {
    for (const phase of ['waiting', 'revealing', 'waving', 'entering'] as const) {
      expect(introPhase(phase, { type: 'ready', reduceMotion: true })).toBe('finished');
    }
  });
  it('can be dismissed during loading or the wave', () => {
    for (const state of ['waiting', 'revealing', 'waving', 'entering'] as const) expect(introPhase(state, { type: 'finish' })).toBe('finished');
  });
  it('does not replay after navigation, another progress update, or turning motion back on', () => {
    expect(introPhase('finished', { type: 'ready', reduceMotion: false })).toBe('finished');
    expect(introPhase('finished', { type: 'ready', reduceMotion: true })).toBe('finished');
    expect(introPhase('finished', { type: 'advance' })).toBe('finished');
  });
});
