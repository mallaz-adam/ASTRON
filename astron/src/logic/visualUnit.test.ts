import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateVisualUnit } from '../data/visualUnit';
import { matchingFeedback, orbitPoint, orbitWords } from './visualUnit';

const unit = validateVisualUnit(JSON.parse(readFileSync(new URL('../../public/content/earth-sun-moon.json', import.meta.url), 'utf8')), { id: 'unit-earth-sun-moon' });

describe('Learner-controlled orbit and guided practice', () => {
  it('moves along a closed path and keeps both schematic orbits inside their drawing', () => {
    for (const close of [false, true]) {
      expect(orbitPoint(0, close).x).toBeCloseTo(orbitPoint(100, close).x);
      expect(orbitPoint(0, close).y).toBeCloseTo(orbitPoint(100, close).y);
      for (let value = 0; value <= 100; value++) {
        const point = orbitPoint(value, close);
        expect(point.x).toBeGreaterThanOrEqual(70); expect(point.x).toBeLessThanOrEqual(350);
        expect(point.y).toBeGreaterThanOrEqual(50); expect(point.y).toBeLessThanOrEqual(242);
      }
    }
    expect(orbitPoint(-10)).toEqual(orbitPoint(0));
    expect(orbitPoint(125)).toEqual(orbitPoint(100));
  });
  it('gives understandable slider state without suggesting a real duration or distance', () => {
    expect(orbitWords(0)).toContain('Earth: at the start');
    expect(orbitWords(100, true)).toContain('Moon: back at the start');
    for (const value of [1, 25, 26, 50, 51, 75, 76, 99]) expect(orbitWords(value)).toContain('pictured path');
  });
  it('recognises all matches without a score and preserves correct labels while explaining each mismatch', () => {
    expect(matchingFeedback(unit, { earth: 'planet', sun: 'star', moon: 'natural satellite' }).every(f => f.correct)).toBe(true);
    const result = matchingFeedback(unit, { earth: 'planet', sun: 'planet', moon: 'star' });
    expect(result.map(r => r.correct)).toEqual([true, false, false]);
    expect(result[1].text).toContain('makes its own light');
    expect(result[2].text).toContain('reflects sunlight');
    expect(matchingFeedback(unit, {}).every(r => r.text.startsWith('Choose a label'))).toBe(true);
  });
});
