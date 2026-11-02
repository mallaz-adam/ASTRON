import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { validateGalaxiesUnit } from '../data/galaxiesUnit';
import { UnitWords, VisualUnitReader } from './VisualUnit';
import { GalaxiesPicture, GalaxyPhoto, GalaxyHomeMap } from './GalaxiesPictures';
import { GalaxyPracticeQuestion } from './GalaxiesPractice';

const content = sampleContent(); const lesson = content.lessons.find(l => l.id === 'unit-galaxies-universe')!;
const data = validateGalaxiesUnit(JSON.parse(readFileSync(new URL('../../public/content/galaxies-universe.json', import.meta.url), 'utf8')), lesson);
describe('Unit 4 reader and accessible visuals', () => {
  it('puts the introduction before its compact map, with one Continue and Reduce motion', () => {
    const html = renderToStaticMarkup(<MemoryRouter><VisualUnitReader lesson={lesson} content={content} data={data} reduceMotion /></MemoryRouter>);
    expect(html).toContain('Chapter 1 · Unit 4'); expect(html.match(/>Continue<\/button>/g)).toHaveLength(1);
    expect(html.indexOf(data.introduction[0])).toBeLessThan(html.indexOf('A home within a wider home'));
    expect(html).toContain('data-reduce-motion="true"'); expect(html).not.toContain('Step 1 of 10');
  });
  it('links each selected definition once and keeps diagrams untimed and explicitly schematic', () => {
    for (const step of data.steps) {
      const words = renderToStaticMarkup(<UnitWords step={step} data={data} />);
      expect(words.match(/class="unit-term"/g)?.length ?? 0).toBe(step.terms.length);
      const picture = renderToStaticMarkup(<GalaxiesPicture data={data} scene={step.scene} />);
      expect(picture).toMatch(/<svg|<img|Relationship diagram/);
      expect(picture).not.toMatch(/<animate|<canvas|setInterval/);
      if (['home', 'contents', 'gravity', 'observation', 'universe', 'observable'].includes(step.scene)) expect(picture).toContain('not to scale');
    }
    const map = renderToStaticMarkup(<GalaxyHomeMap />);
    expect(map).toContain('aria-pressed="true"'); expect(map).toContain('Next home');
  });
  it('uses the right named observation and keeps full credit and licence visible beside it', () => {
    const html = renderToStaticMarkup(<GalaxiesPicture data={data} scene="andromeda" />);
    expect(html).toContain('/art/galaxies/andromeda.webp'); expect(html).not.toContain('/art/galaxies/m51.webp');
    expect(html).toContain('Ground-based observation'); expect(html).toContain('Davide De Martin');
    expect(html).toContain('creativecommons.org/licenses/by/4.0/');
    const model = renderToStaticMarkup(<GalaxyPhoto data={data} id="milky-model" />);
    expect(model).toMatch(/reconstruction/i); expect(model).toContain('Stefan Payne-Wardenaar');
  });
  it('provides native labelled choices without a response before an attempt', () => {
    const html = renderToStaticMarkup(<GalaxyPracticeQuestion question={data.choice} />);
    expect(html.match(/type="radio"/g)).toHaveLength(4); expect(html).not.toContain('role="status"');
    for (const question of data.evidence.questions) {
      const evidence = renderToStaticMarkup(<GalaxyPracticeQuestion question={question} />);
      expect(evidence).toContain(`<legend>${question.prompt}</legend>`); expect(evidence.match(/type="radio"/g)).toHaveLength(2);
    }
  });
});
