import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { galaxyFeedback, galaxyReadingPosition } from './galaxies';
import type { GalaxiesUnitData } from '../data/galaxiesUnit';

const unit: GalaxiesUnitData = JSON.parse(readFileSync(new URL('../../public/content/galaxies-universe.json', import.meta.url), 'utf8'));
describe('Galaxies teaching feedback', () => {
  it('has no response before a valid answer and gives useful feedback for both kinds of attempt', () => {
    for (const question of [unit.choice, ...unit.evidence.questions]) {
      expect(galaxyFeedback(question, '')).toBeNull(); expect(galaxyFeedback(question, 'unknown')).toBeNull();
      const correct = galaxyFeedback(question, question.correct)!;
      const missed = galaxyFeedback(question, question.options.find(o => o.id !== question.correct)!.id)!;
      expect(correct.correct).toBe(true); expect(missed.correct).toBe(false);
      expect(correct.text).not.toBe(missed.text); expect(missed.text.length).toBeGreaterThan(30);
    }
  });
  it('requires the separate recap after all teaching steps', () => {
    expect(galaxyReadingPosition(-1, 10)).toBe('introduction');
    for (let i = 0; i < 10; i++) expect(galaxyReadingPosition(i, 10)).toBe('teaching');
    expect(galaxyReadingPosition(10, 10)).toBe('recap');
  });
});
