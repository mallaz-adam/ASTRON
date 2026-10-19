import { describe, expect, it } from 'vitest';
import { checkStarTint, hunchTint, starColours } from './stars';

describe('A hunch becomes a star tint', () => {
  it.each([['blue', '#A9C4EE'], ['orange', '#E9B173'], ['red', '#D9735A']] as const)('keeps the %s choice and its approved colour', (hunch, colour) => {
    expect(hunchTint(hunch)).toBe(hunch);
    expect(starColours[hunchTint(hunch)]).toBe(colour);
  });
  it('uses pale gold for a skip or a legacy call without a hunch', () => {
    expect(hunchTint('skipped')).toBe('gold');
    expect(hunchTint()).toBe('gold');
    expect(starColours.gold).toBe('#F0D9A8');
  });
  it('accepts absent legacy tints but rejects unsupported data', () => {
    expect(() => checkStarTint(undefined)).not.toThrow();
    for (const value of ['purple', '', null, 0, {}, 'toString']) expect(() => checkStarTint(value)).toThrow('Unknown star tint');
  });
});
