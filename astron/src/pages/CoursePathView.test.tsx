import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { buildCoursePath } from '../logic/coursePath';
import { CoursePathView } from './CoursePathView';

describe('Course path accessible controls', () => {
  it('shows the new first unit at a readable map size, with four forthcoming units and the chapter evaluation', () => {
    const model = buildCoursePath(sampleContent(), { completions: [] }, undefined, undefined, true);
    const html = renderToStaticMarkup(<MemoryRouter><CoursePathView model={model} reduceMotion /></MemoryRouter>);
    expect(html.match(/class="hex-button"/g)).toHaveLength(2);
    expect(html).toContain('0 of 6 units done');
    expect(html).toContain('Unit 1, Earth, the Sun and the Moon');
    expect(html).toContain('Ten questions covering all six units');
    expect(html).toContain('<ol start="3">');
    expect(html.match(/Still being prepared/g)).toHaveLength(4);
  });
  it('uses eleven real selectable buttons and a link to begin the current cell', () => {
    const model = buildCoursePath(sampleContent(), { completions: [] }, undefined, 'first-sky');
    const html = renderToStaticMarkup(<MemoryRouter><CoursePathView model={model} reduceMotion={false} /></MemoryRouter>);
    expect(html.match(/class="hex-button"/g)).toHaveLength(11);
    expect(html).toContain('aria-label="Cell 3, Why stars differ, locked lesson"');
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toContain('href="/cell/orion-lesson"');
    expect(html).toContain('0 of 11 done');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Glaux the owl, thinking');
    expect(html).toContain('Each cell holds a small discovery. Begin with the open one.');
    expect(html).toContain('CHAPTER 2');
    expect(html).toContain('End of chapter');
    expect(html).toContain('Chapter evaluation');
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Coming later<\/button>/);
    expect(html.indexOf('class="chapter-evaluation"')).toBeGreaterThan(html.indexOf('class="course-layout"'));
  });
  it('passes Reduce motion through to the current-cell pulse', () => {
    const model = buildCoursePath(sampleContent(), { completions: [] }, undefined, 'first-sky');
    const html = renderToStaticMarkup(<MemoryRouter><CoursePathView model={model} reduceMotion /></MemoryRouter>);
    expect(html).toContain('data-reduce-motion="true"');
    expect(html.match(/class="hex-pulse"/g)).toHaveLength(1);
  });
});
