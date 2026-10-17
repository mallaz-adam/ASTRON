import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { InteractiveCard } from './InteractiveCards';
import { FuelPicture } from './StarDiagrams';
import { PictureChoice } from './PictureChoice';

const content = sampleContent();
const exercise = content.exercises.find(row => row.id === 'ex-03-choice')!;
const interactive = (kind: 'dial' | 'mass' | 'race' | 'gap', reduceMotion = false) => renderToStaticMarkup(
  <InteractiveCard kind={kind} reduceMotion={reduceMotion} active react={() => {}} />,
);

describe('Accessible interactive lesson diagrams', () => {
  it.each(['dial', 'mass', 'race', 'gap'] as const)('uses a labelled native range and live state in %s', kind => {
    const html = interactive(kind);
    expect(html).toContain('type="range"');
    expect(html).toContain('aria-valuetext=');
    expect(html).toContain('<label');
    expect(html).toContain('role="status"');
    expect(html).toContain('stroke-opacity="0.6"');
    expect(html).not.toContain('Interactive card arrives');
  });
  it('starts the dial at orange and the mass slider at the schematic small red star', () => {
    expect(interactive('dial')).toContain('fill="#E9B173"');
    const mass = interactive('mass');
    expect(mass).toContain('r="16"');
    expect(mass).toContain('fill="#D9735A"');
    expect(mass).toContain('A picture, not to scale.');
  });
  it('starts with full fuel gauges, gives the metaphor note, and hides PLAY under Reduce motion', () => {
    const normal = interactive('race');
    expect(normal).toContain('Both stars are shining.');
    expect(normal).toContain('height="100"'); expect(normal).toContain('height="60"');
    expect(normal).toContain('heavier star'); expect(normal).toContain('lighter star');
    expect(normal).toContain('A picture to help think, not a real container.');
    expect(normal).toContain('>PLAY<');
    const reduced = interactive('race', true);
    expect(reduced).not.toContain('>PLAY<');
    expect(reduced).toContain('type="range"');
  });
  it('draws an empty heavier gauge and a still-bright lighter star at the end', () => {
    const heavy = renderToStaticMarkup(<FuelPicture star="heavier" time={1} />);
    expect(heavy).toContain('fill-opacity="0"');
    expect(heavy).toMatch(/class="fuel-fill"[^>]+height="0"/);
    const light = renderToStaticMarkup(<FuelPicture star="lighter" time={1} />);
    expect(light).toContain('fill-opacity="1"');
    expect(light).not.toMatch(/class="fuel-fill"[^>]+height="0"/);
  });
  it('includes every logarithmic tick and two keyboard-accessible flag buttons', () => {
    const html = interactive('gap');
    for (const label of ['1 million years', '10 million years', '100 million years', '1 billion years', '10 billion years']) expect(html).toContain(label);
    expect(html).toContain('a few million years'); expect(html).toContain('about ten billion years');
    expect(html.match(/<button/g)).toHaveLength(2);
  });
  it('keeps three native radio options with letters and full labels, including two star pictures', () => {
    const html = renderToStaticMarkup(<PictureChoice exercise={exercise} busy={false} active reduceMotion={false} select={() => {}}
      answer={{ selection: [], attempts: 0, hintUsed: false, status: 'ready' }} />);
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    expect(html.match(/class="diagram-plate"/g)).toHaveLength(2);
    for (const text of ['The heavier star.', 'The lighter star.', 'Both live the same time.']) expect(html).toContain(text);
    expect(html).not.toContain('>PLAY<');
  });
});
