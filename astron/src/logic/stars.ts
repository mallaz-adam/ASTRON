import type { HunchChoice, StarTint } from '../data/types';

export const starColours: Record<StarTint, string> = {
  blue: '#A9C4EE', orange: '#E9B173', red: '#D9735A', gold: '#F0D9A8',
};

export function checkStarTint(tint: unknown): asserts tint is StarTint | undefined {
  if (tint !== undefined && (typeof tint !== 'string' || !Object.hasOwn(starColours, tint))) {
    throw new Error('Unknown star tint.');
  }
}

export function hunchTint(hunch?: HunchChoice): StarTint {
  const tint = hunch === 'skipped' || hunch === undefined ? 'gold' : hunch;
  checkStarTint(tint);
  return tint;
}
