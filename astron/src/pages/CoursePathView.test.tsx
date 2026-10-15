import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { buildCoursePath } from '../logic/coursePath';
import { CoursePathView } from './CoursePathView';

describe('Course path accessible controls', () => {
  it('uses eleven real selectable buttons and a link to begin the current cell', () => {
    const model = buildCoursePath(sampleContent(), { completions: [] });
    const html = renderToStaticMarkup(<MemoryRouter><CoursePathView model={model} reduceMotion={false} /></MemoryRouter>);
    expect(html.match(/class="hex-button"/g)).toHaveLength(11);
    expect(html).toContain('aria-label="Cell 3, Why stars differ, locked lesson"');
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).toContain('href="/cell/orion-lesson"');
    expect(html).toContain('0 of 11 done');
    expect(html).toContain('aria-live="polite"');
  });
  it('passes Reduce motion through to the current-cell pulse', () => {
    const model = buildCoursePath(sampleContent(), { completions: [] });
    const html = renderToStaticMarkup(<MemoryRouter><CoursePathView model={model} reduceMotion /></MemoryRouter>);
    expect(html).toContain('data-reduce-motion="true"');
    expect(html.match(/class="hex-pulse"/g)).toHaveLength(1);
  });
});
