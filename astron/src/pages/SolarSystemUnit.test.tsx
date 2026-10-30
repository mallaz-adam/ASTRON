import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { planetIds, validateSolarSystemUnit } from '../data/solarSystemUnit';
import { VisualUnitReader } from './VisualUnit';
import { PlanetOrder, SolarSystemPicture } from './SolarSystemPictures';
import { SolarOrderPractice, SolarSortingPractice } from './SolarSystemPractice';

const content = sampleContent();
const lesson = content.lessons.find(l => l.id === 'unit-our-solar-system')!;
const data = validateSolarSystemUnit(JSON.parse(readFileSync(new URL('../../public/content/our-solar-system.json', import.meta.url), 'utf8')), lesson);
describe('Solar-system reading screens', () => {
  it('opens with the correct unit number, a family picture and one Continue, respecting Reduce motion', () => {
    const html = renderToStaticMarkup(<MemoryRouter><VisualUnitReader data={data} content={content} lesson={lesson} reduceMotion /></MemoryRouter>);
    expect(html).toContain('Chapter 1 · Unit 2'); expect(html).toContain('Our solar system');
    expect(html).toContain('We will meet its eight planets'); expect(html).toContain('Concept map');
    expect(html).toContain('data-reduce-motion="true"'); expect(html).toContain('Pictures and sources');
    expect(html).toContain('Jackie Branc'); expect(html).not.toContain('&lt;font');
    expect(html.match(/>Continue<\/button>/g)).toHaveLength(1);
  });
  it('presents the eight planets in order as labelled native buttons with a scale warning', () => {
    const html = renderToStaticMarkup(<PlanetOrder data={data} />);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(8);
    let previous = -1;
    for (const id of planetIds) {
      const name = data.objects.find(i => i.id === id)!.name;
      const index = html.indexOf(`aria-label="${name},`); expect(index).toBeGreaterThan(previous); previous = index;
    }
    expect(html).toContain('not their positions today'); expect(html).toContain('not to scale');
  });
  it('keeps the order reference available and provides native keyboard controls for both practices', () => {
    const order = renderToStaticMarkup(<SolarOrderPractice data={data} />);
    expect(order.match(/<select/g)).toHaveLength(4); expect(order).toContain('Use the atlas above');
    expect(order).toContain('aria-label="Third from the Sun"'); expect(order).toContain('Hint from Glaux');
    const sorting = renderToStaticMarkup(<SolarSortingPractice data={data} />);
    expect(sorting.match(/<select/g)).toHaveLength(7); expect(sorting).toContain('Group for Pluto');
  });
  it('keeps classification detail optional and provides a visual for every step without autoplay', () => {
    for (const step of data.steps) {
      const html = renderToStaticMarkup(<SolarSystemPicture scene={step.scene} data={data} />);
      expect(html).not.toMatch(/<canvas|<animate|<script/);
      if (step.scene === 'pluto') {
        expect(html).toContain('Why a different group? (optional)');
        expect(html).toContain('Part of our solar system: yes');
        expect(html).not.toContain('has not cleared');
      }
      if (step.scene === 'small-worlds') expect(html).toContain('Tail illustration');
      if (step.scene === 'other-moons') expect(html).toContain('not a complete count');
    }
  });
});
