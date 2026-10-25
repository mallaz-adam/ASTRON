import { describe, expect, it } from 'vitest';
import { introPhase } from './introState';

describe('The opening greeting', () => {
  it('starts the greeting only after preferences are available', () => {
    expect(introPhase('waiting', { type: 'ready', reduceMotion: false })).toBe('waving');
  });
  it('skips the greeting for reduced motion, including a change while waving', () => {
    expect(introPhase('waiting', { type: 'ready', reduceMotion: true })).toBe('finished');
    expect(introPhase('waving', { type: 'ready', reduceMotion: true })).toBe('finished');
  });
  it('can be dismissed during loading or the wave', () => {
    for (const state of ['waiting', 'waving'] as const) expect(introPhase(state, { type: 'finish' })).toBe('finished');
  });
  it('does not replay after navigation, another progress update, or turning motion back on', () => {
    expect(introPhase('finished', { type: 'ready', reduceMotion: false })).toBe('finished');
    expect(introPhase('finished', { type: 'ready', reduceMotion: true })).toBe('finished');
  });
});
