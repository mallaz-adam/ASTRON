import { describe, expect, it } from 'vitest';
import { advanceRace, answerRacePlan, fuelLevels, gapFlags, gapPosition, gapState, gapTicks, heatState, massRadius, nearbyFlag, raceState, starColour, unitPosition } from './lessonDiagrams';

describe('Schematic star colour and mass', () => {
  it.each([[0, '#D9735A'], [.25, '#E19267'], [.5, '#E9B173'], [.75, '#C9BBB1'], [1, '#A9C4EE']])('blends the approved tints at %s', (position, colour) => {
    expect(starColour(position as number)).toBe(colour);
  });
  it('is continuous at orange, clamps the ends, and never invents temperatures', () => {
    expect(starColour(.5 - .000001)).toBe(starColour(.5 + .000001));
    expect(starColour(-1)).toBe('#D9735A'); expect(starColour(2)).toBe('#A9C4EE');
    expect(heatState(0)).toBe('Heat: cooler'); expect(heatState(1)).toBe('Heat: hotter');
    expect(heatState(.5)).toBe('Heat: Orange star');
    expect(unitPosition(NaN)).toBe(0);
  });
  it.each([[0, 16], [.25, 22], [.5, 28], [.75, 34], [1, 40]])('sets the schematic mass radius at %s', (position, radius) => {
    expect(massRadius(position)).toBe(radius);
  });
});

describe('Learner-controlled fuel race', () => {
  it.each([
    [0, 1, 1], [.175, .5, .90375], [.25, 1 - .25 / .35, .8625],
    [.35, 0, .8075], [.5, 0, .725], [1, 0, .45],
  ])('computes both gauge levels at time %s', (time, heavier, lighter) => {
    const result = fuelLevels(time);
    expect(result.heavier).toBeCloseTo(heavier);
    expect(result.lighter).toBeCloseTo(lighter);
  });
  it('dims the heavier star to an outline, while the lighter keeps over forty percent fuel', () => {
    expect(fuelLevels(0).heavyBrightness).toBe(1);
    expect(fuelLevels(.25).heavyBrightness).toBeLessThan(fuelLevels(.175).heavyBrightness);
    expect(fuelLevels(.35).heavyBrightness).toBe(0);
    expect(fuelLevels(1).lighter).toBeGreaterThan(.4);
    expect(fuelLevels(-1)).toEqual(fuelLevels(0)); expect(fuelLevels(2)).toEqual(fuelLevels(1));
    expect(raceState(.25)).toBe('Both stars are shining.');
    expect(raceState(.35)).toBe("The heavier star's fuel is gone. The lighter star still shines.");
  });
  it('advances over six seconds, resumes from a paused position, and stops at the end', () => {
    expect(advanceRace(0, 3000)).toBe(.5);
    expect(advanceRace(.5, 1500)).toBe(.75);
    expect(advanceRace(0, 6000)).toBe(1);
    expect(advanceRace(.9, 6000)).toBe(1);
    expect(advanceRace(.5, -100)).toBe(.5);
  });
  it.each(['correct', 'revealed'] as const)('replays a %s result, or immediately shows its end with reduced motion', status => {
    expect(answerRacePlan(status, false)).toEqual({ time: 0, play: true });
    expect(answerRacePlan(status, true)).toEqual({ time: 1, play: false });
  });
  it('keeps a miss at the quarter-time clue, without starting playback', () => {
    expect(answerRacePlan('missed', false)).toEqual({ time: .25, play: false });
    expect(answerRacePlan('missed', true)).toEqual({ time: .25, play: false });
    expect(answerRacePlan('ready', false)).toEqual({ time: 0, play: false });
  });
});

describe('Logarithmic gap line', () => {
  it('spaces powers of ten evenly, without treating years as a linear distance', () => {
    expect(gapTicks.map(tick => gapPosition(tick.years))).toEqual([0, .25, .5, .75, 1]);
    expect(gapPosition(3_000_000)).toBeCloseTo(.1192803137);
    expect(gapFlags[0].position).toBe(gapPosition(3_000_000));
    expect(gapFlags[1].position).toBe(1);
    expect(gapPosition(1)).toBe(0); expect(gapPosition(1e12)).toBe(1);
  });
  it('recognises both flags only within their small neighbourhood', () => {
    expect(nearbyFlag(gapFlags[0].position)?.event).toBe('gapFlagFew');
    expect(nearbyFlag(gapFlags[0].position + .01)?.id).toBe('few');
    expect(nearbyFlag(gapFlags[0].position + .02)).toBeUndefined();
    expect(nearbyFlag(.99)?.event).toBe('gapFlagTen');
    expect(nearbyFlag(.5)).toBeUndefined();
  });
  it('announces approved year labels and honest intervals instead of extra numbers', () => {
    expect(gapState(0)).toBe('1 million years');
    expect(gapState(.25)).toBe('10 million years');
    expect(gapState(gapFlags[0].position)).toBe('a few million years');
    expect(gapState(.6)).toBe('100 million years – 1 billion years');
    expect(gapState(1)).toBe('about ten billion years');
  });
});
