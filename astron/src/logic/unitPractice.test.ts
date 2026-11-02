import { describe, expect, it } from 'vitest';
import { practiceAfterScene, practiceAttempted } from './unitPractice';

describe('Dedicated teaching practice', () => {
  it.each([
    ['unit-earth-sun-moon', 'paths', 'comparison'],
    ['unit-our-solar-system', 'planet-order', 'pluto'],
    ['unit-stars-milky-way', 'galactic-home', 'two-views'],
    ['unit-galaxies-universe', 'home', 'reconstruction'],
  ])('gives %s two practice phases at the important concepts', (lesson, first, second) => {
    expect(practiceAfterScene(lesson, first)).toMatchObject({ number: 1, total: 2 });
    expect(practiceAfterScene(lesson, second)).toMatchObject({ number: 2, total: 2 });
    expect(practiceAfterScene(lesson, 'unrelated')).toBeNull();
  });
  it('leaves the existing star lesson player and unrelated readers alone', () => {
    expect(practiceAfterScene('lesson-03', 'home')).toBeNull();
    expect(practiceAfterScene('unknown', '')).toBeNull();
  });
  it('requires every answer and shown feedback, rather than correctness', () => {
    expect(practiceAttempted([], true)).toBe(false);
    expect(practiceAttempted(['A', ''], true)).toBe(false);
    expect(practiceAttempted(['A', undefined], true)).toBe(false);
    expect(practiceAttempted(['A', 'B'], false)).toBe(false);
    expect(practiceAttempted(['a missed answer', 'another attempt'], true)).toBe(true);
    expect(practiceAttempted(['A'], true)).toBe(true);
  });
});
