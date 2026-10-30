import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateMilkyWayUnit } from '../data/milkyWayUnit';
import { milkyChoiceFeedback, milkyMatchingFeedback, milkyReadingPosition } from './milkyWay';

const data = validateMilkyWayUnit(JSON.parse(readFileSync(new URL('../../public/content/stars-milky-way.json', import.meta.url), 'utf8')), { id: 'unit-stars-milky-way' });
describe('Milky Way guided practice', () => {
  it('provides specific guidance for all four choices, including both common system/galaxy confusions', () => {
    expect(milkyChoiceFeedback(data, '')).toBeNull(); expect(milkyChoiceFeedback(data, 'missing')).toBeNull();
    expect(milkyChoiceFeedback(data, 'A')).toMatchObject({ correct: true });
    expect(milkyChoiceFeedback(data, 'B')).toMatchObject({ correct: false, text: expect.stringContaining('not a single star') });
    expect(milkyChoiceFeedback(data, 'C')).toMatchObject({ correct: false, text: expect.stringContaining('other stars lie beyond') });
    expect(milkyChoiceFeedback(data, 'D')).toMatchObject({ correct: false, text: expect.stringContaining('not another solar system') });
  });
  it('matches Earth photographs and outside models, with per-card retry feedback and no answer mutation', () => {
    const answers = { band: 'earth', marker: 'earth', panorama: 'earth', side: 'earth' };
    const before = JSON.stringify(answers);
    const feedback = milkyMatchingFeedback(data, answers);
    expect(feedback.map(f => f.correct)).toEqual([true, false, true, false]);
    expect(feedback[1].text).toContain('measurements'); expect(feedback[3].text).toContain('not an Earth photograph');
    expect(JSON.stringify(answers)).toBe(before);
    expect(milkyMatchingFeedback(data, {}).every(f => !f.correct && f.text.includes('Choose a view'))).toBe(true);
    expect(milkyMatchingFeedback(data, { band: 'earth', marker: 'outside', panorama: 'earth', side: 'outside' }).every(f => f.correct)).toBe(true);
  });
  it('keeps the introduction, all ten teaching screens and the separate recap distinct', () => {
    expect(milkyReadingPosition(-1, 10)).toBe('introduction');
    for (let index = 0; index < 10; index++) expect(milkyReadingPosition(index, 10)).toBe('teaching');
    expect(milkyReadingPosition(10, 10)).toBe('recap');
  });
});
