import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { glauxLine } from './glauxVoice';
import { buildCoursePath } from './coursePath';

const content = sampleContent();

describe('The atlas keeper across the app', () => {
  it('formats the remaining quest count with plain singular and plural words', () => {
    expect(glauxLine(content, 'todayBegin', { remaining: 1, questWord: 'quest' })).toContain('Begin with 1 quest today.');
    expect(glauxLine(content, 'todayContinue', { remaining: 2, questWord: 'quests' })).toContain('Finish 2 more quests today');
    expect(glauxLine(content, 'sunGrowing', { days: 13 })).toContain('13 days of light');
  });
  it('requires every interpolation value rather than showing an unfinished template', () => {
    expect(() => glauxLine(content, 'todayBegin')).toThrow('missing remaining');
    expect(() => glauxLine({ glauxLines: [] }, 'pathBegin')).toThrow('missing dialogue');
  });
  it('changes path guidance with progress, with no extra speech for a cell selection', () => {
    const completion = (cellId: string) => ({ learnerId: 'one', cellId, completedOn: '2026-10-23T12:00:00Z', correctAnswers: 0, xpEarned: 0 });
    expect(buildCoursePath(content, { completions: [] }, 'one').glaux).toBe(glauxLine(content, 'pathBegin'));
    expect(buildCoursePath(content, { completions: [completion(content.cells[0].id)] }, 'one').glaux).toBe(glauxLine(content, 'pathContinue'));
    expect(buildCoursePath(content, { completions: content.cells.map(cell => completion(cell.id)) }, 'one').glaux).toBe(glauxLine(content, 'pathComplete'));
  });
  it('keeps dialogue short while retaining the existing exercises, rewards and answer definitions', () => {
    for (const pool of content.glauxLines) for (const line of pool.lines) {
      expect(line.trim().split(/\s+/).length, pool.id).toBeLessThanOrEqual(15);
    }
    const exercises = content.exercises.filter(row => row.cellId === 'star-lesson');
    expect(exercises.map(row => row.xpValue)).toEqual([10, 10]);
    expect(exercises[0].contentData.correctOrder).toEqual(['red', 'orange', 'blue']);
    expect(exercises[1].contentData.correctOptionId).toBe('A');
  });
});
