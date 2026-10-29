import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { validateVisualUnit } from '../data/visualUnit';
import { UnitChoice, UnitMatching, UnitWords, VisualUnitReader } from './VisualUnit';
import { OrbitExplorer, UnitPicture } from './UnitPictures';

const content = sampleContent();
const lesson = content.lessons.find(l => l.id === 'unit-earth-sun-moon')!;
const data = validateVisualUnit(JSON.parse(readFileSync(new URL('../../public/content/earth-sun-moon.json', import.meta.url), 'utf8')), lesson);

describe('The illustrated beginner unit', () => {
  it('starts with a short introduction, three real local images and a single Continue', () => {
    const html = renderToStaticMarkup(<MemoryRouter><VisualUnitReader data={data} lesson={lesson} content={content} reduceMotion /></MemoryRouter>);
    expect(html).toContain('Chapter 1 · Unit 1');
    expect(html).toContain('We will discover why the Moon shines.');
    expect(html.match(/>Continue<\/button>/g)).toHaveLength(1);
    expect(html.match(/<img/g)).toHaveLength(3);
    expect(html).toContain('data-reduce-motion="true"');
    expect(html).toContain('Pictures and sources');
    expect(html).not.toContain('Step 1 of 10');
  });
  it('links a term once, keeps ordinary mentions readable, and exposes the definition control state', () => {
    const step = data.steps.find(s => s.id === 'sun')!;
    const html = renderToStaticMarkup(<UnitWords step={step} data={data} />);
    expect(html.match(/class="unit-term"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="star: read the definition"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('A star is a huge, very hot ball of gas.');
    expect(html).not.toContain('role="link"');
  });
  it('offers keyboard-native optional practice with complete labels and no assessment score', () => {
    const matching = renderToStaticMarkup(<UnitMatching data={data} />);
    expect(matching.match(/<select/g)).toHaveLength(3);
    expect(matching).toContain('aria-label="Label for Moon"');
    const choice = renderToStaticMarkup(<UnitChoice data={data} />);
    expect(choice.match(/type="radio"/g)).toHaveLength(3);
    expect(choice).toContain('Hint from Glaux');
    expect(choice).not.toContain('timer');
    expect(choice).not.toContain('score');
  });
  it('uses a genuine range control with its initial position described in words', () => {
    const html = renderToStaticMarkup(<OrbitExplorer />);
    expect(html).toContain('type="range"');
    expect(html).toContain('aria-valuetext="Earth: at the start of the pictured path."');
    expect(html).toContain('Dashed line: orbit. Arrow: movement direction.');
  });
  it('provides a described, untimed visual for every teaching step and labels schematic limitations', () => {
    for (const step of data.steps) {
      const html = renderToStaticMarkup(<UnitPicture scene={step.scene} data={data} />);
      if (['orbit', 'moon', 'paths', 'sunlight', 'reflection', 'comparison'].includes(step.scene)) {
        expect(html).toContain('role="img"'); expect(html).toMatch(/not to scale/i);
      }
      expect(html).not.toMatch(/<canvas|<animate|<script/);
    }
    expect(renderToStaticMarkup(<UnitPicture scene="reflection" data={data} />)).toContain('Solid arrows show light travelling');
  });
});
