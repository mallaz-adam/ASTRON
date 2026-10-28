import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { validateExplorationLesson } from '../data/explorationLesson';
import type { Completion } from '../data/types';
import { nextReadingDestination, readingSteps } from './readingFlow';

const content = sampleContent();
const lesson = content.lessons.find(item => item.id === 'patterns')!;
const data = validateExplorationLesson(JSON.parse(readFileSync(new URL('../../public/content/lesson-01.json', import.meta.url), 'utf8')), lesson, content);
const learner = 'reader';
const completed = (cellId: string): Completion => ({ learnerId: learner, cellId, completedOn: '2026-10-28T12:00:00Z', correctAnswers: 0, xpEarned: 0 });

describe('A connected reading journey', () => {
  it('keeps every teaching paragraph exactly once and in authored order', () => {
    const before = structuredClone(data);
    const steps = readingSteps(data);
    expect(steps.flatMap(step => step.paragraphs)).toEqual(data.sections.flatMap(section => section.paragraphs));
    expect(new Set(steps.map(step => step.id)).size).toBe(steps.length);
    expect(data).toEqual(before);
  });
  it('paces the current lesson in short readings and separate explorations', () => {
    const steps = readingSteps(data);
    expect(steps).toHaveLength(16);
    for (const section of data.sections) {
      const [reading, exploration] = steps.filter(step => step.section.id === section.id);
      expect(reading.explore).toBe(false);
      expect(reading.paragraphs.join(' ').split(/\s+/).length).toBeLessThan(90);
      expect(exploration.explore).toBe(true);
      expect(exploration.paragraphs).toEqual(section.paragraphs.slice(-1));
    }
  });
  it('also preserves a single-paragraph section', () => {
    const section = { ...data.sections[0], paragraphs: ['One connected idea.'] };
    expect(readingSteps({ sections: [section] })).toMatchObject([{ paragraphs: ['One connected idea.'], explore: true }]);
  });
  it('waits for the current learner’s saved completion before offering the next content', () => {
    expect(nextReadingDestination(content, undefined, learner, lesson.cellId)).toBeNull();
    expect(nextReadingDestination(content, { completions: [] }, learner, lesson.cellId)).toBeNull();
    expect(nextReadingDestination(content, { completions: [{ ...completed(lesson.cellId), learnerId: 'other' }] }, learner, lesson.cellId)).toBeNull();
  });
  it('continues directly to the next authored lesson, skipping the unwritten lesson two', () => {
    expect(nextReadingDestination(content, { completions: [completed(lesson.cellId)] }, learner, lesson.cellId))
      .toEqual({ to: '/cell/star-lesson', title: 'Why stars differ' });
  });
  it('allows the next lesson on replay and returns to the path after the last authored content', () => {
    const progress = { completions: ['orion-lesson', 'star-lesson', 'orion-tale'].map(completed) };
    expect(nextReadingDestination(content, progress, learner, lesson.cellId)?.to).toBe('/cell/star-lesson');
    expect(nextReadingDestination(content, progress, learner, 'orion-tale')).toEqual({ to: '/learn', title: 'Back to the path' });
  });
});
