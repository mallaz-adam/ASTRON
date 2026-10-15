import { describe, expect, it } from 'vitest';
import type { Completion } from '../data/types';
import { sampleContent } from '../data/contentFixtures';
import { buildCoursePath } from './coursePath';
import { hexPoints, hexPosition, honeycombSize, titleLines } from './honeycomb';

const content = sampleContent();
const learnerId = 'one';
function completion(cellId: string): Completion {
  return { learnerId, cellId, completedOn: '2026-10-15T12:00:00Z', correctAnswers: 0, xpEarned: 0 };
}
function model(count: number) {
  return buildCoursePath(content, { completions: content.cells.slice(0, count).map(cell => completion(cell.id)) }, learnerId);
}

describe('Course path rules', () => {
  it('opens cell one and locks the other ten when nothing is done', () => {
    const path = model(0);
    expect(path.current?.positionNo).toBe(1);
    expect(path.cells.map(cell => cell.state)).toEqual(['current', ...Array(10).fill('locked')]);
    expect(path.countText).toBe('0 of 11 done');
  });
  it('shows three done and the Orion tale current', () => {
    const path = model(3);
    expect(path.cells.slice(0, 3).every(cell => cell.state === 'done')).toBe(true);
    expect(path.current).toMatchObject({ positionNo: 4, kind: 'tale', title: 'Orion', line: '6 min · lights one star' });
    expect(path.countText).toBe('3 of 11 done');
  });
  it('shows all done with no invented current cell', () => {
    const path = model(11);
    expect(path.current).toBeNull();
    expect(path.cells.every(cell => cell.state === 'done' && cell.action === 'AGAIN')).toBe(true);
    expect(path.countText).toBe('11 of 11 done');
  });
  it('opens a cell only after every earlier step, without counting unknown or other learners', () => {
    const path = buildCoursePath(content, { completions: [completion(content.cells[3].id), completion('missing'), { ...completion(content.cells[0].id), learnerId: 'other' }] }, learnerId);
    expect(path.current?.positionNo).toBe(1);
    expect(path.doneCount).toBe(1);
    expect(path.cells[4].state).toBe('locked');
    expect(path.cells[4].line).toBe('Finish the cell before it to open this one.');
  });
  it('treats a duplicated completion as one done cell', () => {
    const first = completion(content.cells[0].id);
    expect(buildCoursePath(content, { completions: [first, first] }, learnerId).doneCount).toBe(1);
  });
  it('shows the quiz details and opens it after cell ten', () => {
    expect(model(10).current).toMatchObject({ kind: 'quiz', positionNo: 11, line: '5 min · a mix of everything' });
  });
  it('uses authored order without mutating the input', () => {
    const shuffled = { ...content, cells: [...content.cells].reverse() };
    const before = [...shuffled.cells];
    expect(buildCoursePath(shuffled, { completions: [] }, learnerId).cells.map(cell => cell.positionNo)).toEqual(Array.from({ length: 11 }, (_, index) => index + 1));
    expect(shuffled.cells).toEqual(before);
  });
});

describe('Honeycomb geometry', () => {
  it('uses four, three and four centres with the middle row reversed and shifted', () => {
    const points = Array.from({ length: 11 }, (_, index) => hexPosition(index));
    const w = 50 * Math.sqrt(3);
    expect(points.slice(0, 4).map(point => point.y)).toEqual(Array(4).fill(58));
    expect(points.slice(4, 7).map(point => point.y)).toEqual(Array(3).fill(133));
    expect(points.slice(7).map(point => point.y)).toEqual(Array(4).fill(208));
    expect(points[4].x - points[5].x).toBeCloseTo(w);
    expect(points[5].x - points[6].x).toBeCloseTo(w);
    expect(points[6].x - points[0].x).toBeCloseTo(w / 2);
    expect(points[7].x).toBe(points[0].x);
  });
  it('keeps all six vertices inside the map and leaves the requested three-unit radius gap', () => {
    for (let index = 0; index < 11; index++) {
      const { x, y } = hexPosition(index);
      const points = hexPoints(x, y).split(' ').map(pair => pair.split(',').map(Number));
      expect(points).toHaveLength(6);
      for (const [px, py] of points) {
        expect(Math.hypot(px - x, py - y)).toBeCloseTo(honeycombSize.radius - 3);
        expect(px).toBeGreaterThan(0); expect(px).toBeLessThan(honeycombSize.width);
        expect(py).toBeGreaterThan(0); expect(py).toBeLessThan(honeycombSize.height);
      }
    }
  });
  it('uses no more than two lines and loses none of a cell title', () => {
    for (const cell of content.cells) {
      const lines = titleLines(cell.title);
      expect(lines.length).toBeLessThanOrEqual(2);
      expect(lines.join(' ')).toBe(cell.title);
    }
  });
});
