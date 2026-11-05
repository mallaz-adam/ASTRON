import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import type { Completion, Content } from '../data/types';
import { buildLearningRoadmap, learningCellAccess } from './learningRoadmap';

const learner = 'roadmap-reader';
const completion = (cellId: string): Completion => ({ learnerId: learner, cellId, completedOn: '2026-11-05T12:00:00Z', correctAnswers: 0, xpEarned: 0 });
const saved = (...ids: string[]) => ({ completions: ids.map(completion) });
const firstUnits = ['earth-sun-moon', 'our-solar-system', 'stars-milky-way', 'galaxies-universe', 'sizes-distances', 'light-travel-time'];
function futureReadyChapter(): Content {
  const content = structuredClone(sampleContent());
  // A future authoring fixture, not a claim that the real evaluation exists.
  for (const lesson of content.lessons) if (firstUnits.includes(lesson.cellId)) lesson.placeholder = false;
  content.lessons.push({ id: 'future-chapter-evaluation', cellId: 'our-place-evaluation', title: 'Chapter evaluation', cards: [] });
  return content;
}

describe('The chapter roadmap', () => {
  it('starts at the beginner chapter and previews the later chapter as locked', () => {
    const model = buildLearningRoadmap(sampleContent(), saved(), learner);
    expect(model.chapters.map(chapter => [chapter.id, chapter.state])).toEqual([['our-place', 'available'], ['first-sky', 'locked']]);
    expect(model.next).toMatchObject({ to: '/cell/earth-sun-moon', started: false });
    expect(model.chapters[1].lockReason).toContain('Complete the evaluation in Our place in space');
  });
  it('separates progress locks from content being prepared, without hiding planned units', () => {
    const first = buildLearningRoadmap(sampleContent(), saved(), learner).chapters[0];
    expect(first.cells.map(cell => cell.state)).toEqual(['available', 'locked', 'locked', 'locked', 'preparing', 'preparing']);
    expect(first.countText).toBe('0 of 6 units completed');
    expect(first.readyCount).toBe(4);
    expect(first.evaluation).toMatchObject({ state: 'preparing', to: null });
  });
  it('opens the next ready unit after a completion and preserves a review link', () => {
    const model = buildLearningRoadmap(sampleContent(), saved('earth-sun-moon'), learner);
    expect(model.next).toMatchObject({ to: '/cell/our-solar-system', started: true });
    expect(model.chapters[0].cells[0]).toMatchObject({ state: 'completed', to: '/cell/earth-sun-moon' });
  });
  it('finishing only the available lessons does not finish the chapter or offer an invented lesson', () => {
    const model = buildLearningRoadmap(sampleContent(), saved(...firstUnits.slice(0, 4)), learner);
    expect(model.next).toBeNull();
    expect(model.chapters[0]).toMatchObject({ doneCount: 4, state: 'available' });
    expect(model.chapters[1].unlocked).toBe(false);
  });
  it('cannot unlock a chapter with development placeholder completions', () => {
    const model = buildLearningRoadmap(sampleContent(), saved(...firstUnits, 'our-place-evaluation'), learner);
    expect(model.chapters[0].state).not.toBe('completed');
    expect(model.chapters[1].state).toBe('locked');
  });
  it('all taught units alone leave an authored evaluation available, without unlocking the next chapter', () => {
    const model = buildLearningRoadmap(futureReadyChapter(), saved(...firstUnits), learner);
    expect(model.chapters[0].evaluation).toMatchObject({ state: 'available', to: '/cell/our-place-evaluation' });
    expect(model.next?.to).toBe('/cell/our-place-evaluation');
    expect(model.chapters[1].unlocked).toBe(false);
  });
  it('requires every unit even if an evaluation completion already exists', () => {
    const model = buildLearningRoadmap(futureReadyChapter(), saved(...firstUnits.slice(0, 5), 'our-place-evaluation'), learner);
    expect(model.chapters[0].evaluation.state).toBe('locked');
    expect(model.chapters[1].unlocked).toBe(false);
  });
  it('unlocks the next chapter after a completed authored evaluation without a score threshold', () => {
    const model = buildLearningRoadmap(futureReadyChapter(), saved(...firstUnits, 'our-place-evaluation'), learner);
    expect(model.chapters[0].state).toBe('completed');
    expect(model.chapters[0].evaluation.state).toBe('completed');
    expect(model.chapters[1].state).toBe('available');
    expect(model.currentChapterId).toBe('first-sky');
    expect(model.next?.to).toBe('/cell/orion-lesson');
  });
  it('keeps a previously completed lesson reviewable in a later locked chapter', () => {
    const content = sampleContent();
    const progress = saved('star-lesson');
    expect(learningCellAccess(content, progress, learner, 'star-lesson').allowed).toBe(true);
    expect(learningCellAccess(content, progress, learner, 'orion-lesson').allowed).toBe(false);
    expect(buildLearningRoadmap(content, progress, learner).chapters[1].state).toBe('locked');
  });
  it('story progress never fabricates the science prerequisites or unlocks its chapter', () => {
    const model = buildLearningRoadmap(sampleContent(), saved('orion-tale', 'pleiades-tale'), learner);
    expect(model.chapters[1]).toMatchObject({ state: 'locked', doneCount: 2 });
    expect(model.next?.to).toBe('/cell/earth-sun-moon');
  });
  it('does not count unknown, duplicate or another learner’s completions', () => {
    const progress = saved('earth-sun-moon', 'earth-sun-moon', 'unknown');
    progress.completions.push({ ...completion('our-solar-system'), learnerId: 'another' });
    expect(buildLearningRoadmap(sampleContent(), progress, learner).chapters[0].doneCount).toBe(1);
  });
  it('reports missing or unprepared lessons without allowing them to open', () => {
    const content = sampleContent();
    for (const id of ['unknown', 'sizes-distances', 'our-place-evaluation']) {
      expect(learningCellAccess(content, saved(), learner, id)).toEqual({ allowed: false, reason: 'This lesson is still being prepared.' });
    }
  });
  it('a missing evaluation cannot mark a chapter complete', () => {
    const content = futureReadyChapter();
    content.cells = content.cells.filter(cell => cell.id !== 'our-place-evaluation');
    expect(buildLearningRoadmap(content, saved(...firstUnits), learner).chapters[1].unlocked).toBe(false);
  });
  it('a completed later chapter cannot bypass an unfinished earlier chapter', () => {
    const content = futureReadyChapter();
    for (const lesson of content.lessons) lesson.placeholder = false;
    content.units.push({ id: 'third', orderNo: 3, title: 'Future chapter', summary: 'Not authored.' });
    const secondIds = content.cells.filter(cell => cell.unitId === 'first-sky').map(cell => cell.id);
    expect(buildLearningRoadmap(content, saved(...secondIds), learner).chapters[2].unlocked).toBe(false);
  });
  it('sorts content without mutating content or progress', () => {
    const content = structuredClone(sampleContent());
    content.units.reverse(); content.cells.reverse();
    const progress = saved('earth-sun-moon');
    const before = structuredClone({ content, progress });
    const model = buildLearningRoadmap(content, progress, learner);
    expect(model.chapters[0].cells.map(cell => cell.positionNo)).toEqual([1, 2, 3, 4, 5, 6]);
    expect({ content, progress }).toEqual(before);
  });
});
