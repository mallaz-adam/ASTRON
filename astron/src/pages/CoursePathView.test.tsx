import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { buildLearningRoadmap } from '../logic/learningRoadmap';
import { CoursePathView } from './CoursePathView';

const content = sampleContent();
const learner = 'roadmap-reader';
const completion = (cellId: string) => ({ learnerId: learner, cellId, completedOn: '2026-11-05T12:00:00Z', correctAnswers: 0, xpEarned: 0 });
function view(ids: string[] = [], selectedChapterId?: string) {
  const model = buildLearningRoadmap(content, { completions: ids.map(completion) }, learner);
  return renderToStaticMarkup(<MemoryRouter><CoursePathView model={model} selectedChapterId={selectedChapterId} reduceMotion /></MemoryRouter>);
}

describe('A readable learning roadmap', () => {
  it('shows chapters as real preview buttons and one primary next-lesson action', () => {
    const html = view();
    expect(html).toContain('<h1>Your learning path</h1>');
    expect(html.match(/aria-controls="chapter-overview"/g)).toHaveLength(2);
    expect(html.match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(html.match(/atlas-button--primary/g)).toHaveLength(1);
    expect(html).toContain('href="/cell/earth-sun-moon"');
    expect(html.indexOf('class="roadmap-next"')).toBeLessThan(html.indexOf('class="roadmap-layout"'));
    expect(html).toContain('Choose a chapter to see its units');
  });
  it('shows all six units, readable states, labelled progress and a separate unfinished evaluation', () => {
    const html = view();
    expect(html.match(/<li class="roadmap-unit /g)).toHaveLength(6);
    expect(html).toContain('0 of 6 units completed');
    expect(html).toContain('4 of 6 units ready');
    expect(html).toContain('<label for="chapter-progress">');
    expect(html).toContain('<progress id="chapter-progress" aria-label="Our place in space: 0 of 6 units completed" value="0" max="6"');
    expect(html).toContain('Ready to begin');
    expect(html).toContain('Still being prepared');
    expect(html).not.toContain('href="/cell/sizes-distances"');
    expect(html).not.toContain('href="/cell/our-place-evaluation"');
    expect(html.indexOf('class="chapter-evaluation"')).toBeGreaterThan(html.indexOf('class="roadmap-units"'));
    expect(html).toContain('End of chapter · 10 questions');
    expect(html).toContain('There is no minimum score.');
  });
  it('offers Continue for the next unit and review links for completed ones', () => {
    const html = view(['earth-sun-moon']);
    expect(html).toMatch(/href="\/cell\/our-solar-system"[^>]*>CONTINUE<\/a>/);
    expect(html).toContain('Completed · Review');
    expect(html).toContain('href="/cell/earth-sun-moon"');
    expect(html).not.toContain('href="/cell/stars-milky-way"');
  });
  it('previews a locked chapter without linking to its uncompleted science lessons', () => {
    const html = view([], 'first-sky');
    expect(html).toContain('Chapter 2 · Locked');
    expect(html).toContain('Complete the evaluation in Our place in space');
    expect(html.match(/<li class="roadmap-unit /g)).toHaveLength(10);
    expect(html).not.toContain('href="/cell/orion-lesson"');
    expect(html).not.toContain('href="/cell/star-lesson"');
    expect(html).toContain('Greek stories are also available in Stories.');
  });
  it('shows a truthful waiting state after the four available units, without an invented Continue', () => {
    const html = view(['earth-sun-moon', 'our-solar-system', 'stars-milky-way', 'galaxies-universe']);
    expect(html).toContain('You have finished the available lessons.');
    expect(html).toContain('4 of 6 units completed');
    expect(html).not.toContain('atlas-button--primary');
    expect(html).toContain('Glaux the owl, thinking');
  });
  it('falls back safely for an unknown chapter and respects Reduce motion', () => {
    const html = view([], 'unknown');
    expect(html).toContain('Chapter 1 · Available');
    expect(html).toContain('data-reduce-motion="true"');
  });
});
