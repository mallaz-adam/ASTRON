import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateSolarSystemUnit } from '../data/solarSystemUnit';
import { innerOrderFeedback, solarSortingFeedback } from './solarSystem';

const data = validateSolarSystemUnit(JSON.parse(readFileSync(new URL('../../public/content/our-solar-system.json', import.meta.url), 'utf8')), { id: 'unit-our-solar-system' });
describe('Ungraded solar-system practice', () => {
  it('recognises order, preserves correct placements and explains the specific misplaced neighbour', () => {
    const answers = ['mercury', 'earth', 'venus', 'mars']; const before = [...answers];
    const feedback = innerOrderFeedback(data, answers);
    expect(feedback.map(f => f.correct)).toEqual([true, false, false, true]);
    expect(feedback[1].text).toContain('Venus'); expect(feedback[2].text).toContain('Earth');
    expect(answers).toEqual(before);
    expect(innerOrderFeedback(data, data.orderPractice.correctOrder).every(f => f.correct)).toBe(true);
    expect(innerOrderFeedback(data, ['', '', '', '']).every(f => f.text.startsWith('Choose'))).toBe(true);
  });
  it('does not mistake two copies of the same planet for a complete order', () => {
    expect(innerOrderFeedback(data, ['mercury', 'mercury', 'earth', 'mars']).map(f => f.correct)).toEqual([true, false, true, true]);
  });
  it('recognises all seven groups and explains each mistaken card without a score', () => {
    const correct = Object.fromEntries(data.sorting.cards.map(c => [c.id, c.group]));
    expect(solarSortingFeedback(data, correct).every(f => f.correct)).toBe(true);
    for (const card of data.sorting.cards) for (const group of data.sorting.groups.filter(g => g.id !== card.group)) {
      const feedback = solarSortingFeedback(data, { ...correct, [card.id]: group.id });
      expect(feedback.find(f => f.id === card.id)).toMatchObject({ correct: false, text: card.feedback });
      expect(feedback.filter(f => f.correct)).toHaveLength(6);
    }
    expect(solarSortingFeedback(data, {}).every(f => f.text.startsWith('Choose'))).toBe(true);
  });
});
