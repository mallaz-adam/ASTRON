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
    expect(html).toContain('Step 1 of 13');
    expect(html).toContain('aria-label="Unit progress"');
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
  it('offers one picture at a time with native radio roles, object navigation and an incomplete-attempt guard', () => {
    const matching = renderToStaticMarkup(<UnitMatching data={data} />);
    expect(matching).not.toContain('<select');
    expect(matching.match(/type="radio"/g)).toHaveLength(3);
    expect(matching).toContain('aria-label="Earth: Star. Makes its own light"');
    expect(matching).toContain('Choose an object to match');
    expect(matching).toContain('0 of 3 objects chosen');
    expect(matching).toContain('>Next: Sun</button>');
    expect(matching).toMatch(/<button[^>]*disabled=""[^>]*>Check the matches<\/button>/);
    expect(matching.match(/<img/g)).toHaveLength(1);
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
      if (['orbit', 'paths', 'sunlight', 'reflection', 'comparison'].includes(step.scene)) {
        expect(html).toContain('role="img"'); expect(html).toMatch(/not to scale/i);
      }
      expect(html).not.toMatch(/<canvas|<animate|<script/);
    }
    expect(renderToStaticMarkup(<UnitPicture scene="reflection" data={data} />)).toContain('Solid arrows show light travelling');
  });
  it('puts each light instruction, control and live result before the large diagram', () => {
    for (const scene of ['sunlight', 'reflection', 'comparison', 'paths'] as const) {
      const html = renderToStaticMarkup(<UnitPicture scene={scene} data={data} />);
      expect(html).toContain('class="unit-instruction"');
      expect(html.indexOf('role="status"')).toBeLessThan(html.indexOf('<svg'));
      expect(html).toContain('aria-atomic="true"');
    }
    const moon = renderToStaticMarkup(<UnitPicture scene="moon" data={data} />);
    expect(moon.match(/<img/g)).toHaveLength(1);
    expect(moon).not.toContain('<svg');
  });
  it('distinguishes optional explanation reveals from required practice', () => {
    const html = renderToStaticMarkup(<UnitPicture scene="sun" data={data} />);
    expect(html).toContain('Think about it · Optional');
    expect(html).toContain('>Show explanation</button>');
    expect(html).toContain('aria-controls=');
    expect(html).toContain('aria-expanded="false"');
  });
});
