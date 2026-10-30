import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { validateMilkyWayUnit } from '../data/milkyWayUnit';
import { VisualUnitReader, UnitWords } from './VisualUnit';
import { MilkyWayPicture, MilkyViewComparison } from './MilkyWayPictures';
import { MilkyChoicePractice, MilkyMatchingPractice } from './MilkyWayPractice';

const content = sampleContent();
const lesson = content.lessons.find(l => l.id === 'unit-stars-milky-way')!;
const data = validateMilkyWayUnit(JSON.parse(readFileSync(new URL('../../public/content/stars-milky-way.json', import.meta.url), 'utf8')), lesson);
describe('Milky Way teaching screens', () => {
  it('opens Unit 3 with one Continue, authentic local media, visible attribution and Reduce motion', () => {
    const html = renderToStaticMarkup(<MemoryRouter><VisualUnitReader data={data} lesson={lesson} content={content} reduceMotion /></MemoryRouter>);
    expect(html).toContain('Chapter 1 · Unit 3'); expect(html.match(/>Continue<\/button>/g)).toHaveLength(1);
    expect(html).toContain('data-reduce-motion="true"'); expect(html).toContain('A. Trigo/ESO');
    expect(html).toContain('Photograph · from Earth'); expect(html).toContain('creativecommons.org/licenses/by/4.0/');
    expect(html).not.toContain('Step 1 of 10');
  });
  it('makes the plain brightness phrase and every selected term an actual definition button', () => {
    for (const step of data.steps) {
      const html = renderToStaticMarkup(<UnitWords step={step} data={data} />);
      if (step.terms.length) expect(html.match(/class="unit-term"/g)).toHaveLength(step.terms.length);
    }
    const html = renderToStaticMarkup(<UnitWords step={data.steps[2]} data={data} />);
    expect(html).toContain('How bright a star looks: read the definition');
  });
  it('keeps picture meanings and media types visible without opening drawers or requiring motion', () => {
    for (const step of data.steps) {
      const html = renderToStaticMarkup(<MilkyWayPicture scene={step.scene} data={data} />);
      expect(html).toMatch(/<svg|<img/); expect(html).not.toMatch(/<animate|<canvas|setInterval/);
      if (['brightness', 'star-depth', 'solar-group', 'galactic-home'].includes(step.scene)) expect(html).toContain('not to scale');
      if (['galaxy-views', 'our-location', 'two-views'].includes(step.scene)) expect(html).toContain('Scientific reconstruction');
    }
    const comparison = renderToStaticMarkup(<MilkyViewComparison data={data} interactive={false} />);
    expect(comparison).toContain('Bruno Gilli/ ESO'); expect(comparison).toContain('Stefan Payne-Wardenaar');
    expect(comparison).toContain('One galaxy, two kinds of pictures'); expect(comparison).not.toContain('<button');
  });
  it('provides labelled native radio choices and matching selects with optional hints', () => {
    const choice = renderToStaticMarkup(<MilkyChoicePractice data={data} />);
    expect(choice.match(/type="radio"/g)).toHaveLength(4); expect(choice).toContain('Hint from Glaux');
    expect(choice).not.toContain('role="status"');
    const matching = renderToStaticMarkup(<MilkyMatchingPractice data={data} />);
    expect(matching.match(/<select/g)).toHaveLength(4); expect(matching).toContain('View for: A pale band');
    expect(matching).toContain('Outside reconstruction'); expect(matching).toContain('Check the views');
  });
});
