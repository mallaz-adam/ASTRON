import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../../data/contentFixtures';
import { validateTaleExperience, type IllustratedTaleData } from '../../data/taleExperience';
import { ProgressProvider } from '../../hooks/useProgress';
import { IllustratedChapter, IllustratedEnding, IllustratedEpilogue } from './IllustratedTale';
import { TaleCover } from './TaleScenes';

const data = validateTaleExperience(JSON.parse(readFileSync(new URL('../../../public/content/pleiades.json', import.meta.url), 'utf8'))) as IllustratedTaleData;
const content = sampleContent();
const render = (element: React.ReactNode) => renderToStaticMarkup(<ProgressProvider><MemoryRouter>{element}</MemoryRouter></ProgressProvider>);

describe('The illustrated Pleiades reader', () => {
  it('shows its own credited painting rather than the Orion cover', () => {
    const html = render(<TaleCover data={data} tale={content.tales.find(tale => tale.id === data.taleId)!} busy={false} resume={false} onBegin={() => {}} />);
    expect(html).toContain('/art/pleiades/vedder-640.webp');
    expect(html).toContain('1280w'); expect(html).toContain('Elihu Vedder');
    expect(html).toContain('missing-star motif');
    expect(html).not.toContain('/art/orion/cover');
  });
  it('preserves all seven scenes with context before artwork and no compulsory questions', () => {
    for (const chapter of content.chapters.filter(scene => scene.taleId === data.taleId)) {
      const html = render(<IllustratedChapter chapter={chapter} data={data} />);
      for (const paragraph of chapter.text.split(/\n\s*\n/)) {
        const text = renderToStaticMarkup(<p>{paragraph}</p>);
        expect(html.split(text)).toHaveLength(2);
      }
      expect(html.indexOf('<h1')).toBeLessThan(html.indexOf('<figure'));
      expect(html).toContain(`/art/pleiades/scene-${chapter.number}.svg`);
      expect(html).not.toContain('type="radio"');
    }
  });
  it('distinguishes the real photograph from the diagram and exposes the two optional details', () => {
    const html = render(<IllustratedEpilogue data={data} collected={false} />);
    expect(html).toContain('/art/pleiades/cluster-960.webp');
    expect(html).toContain('ESO/S. Brunier'); expect(html).toContain('CC BY 4.0');
    expect(html).toContain('aria-pressed="true"'); expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('Another ancient voice'); expect(html).toContain('Why not exactly seven?');
    expect(html).toContain('data-unseen="true"');
    expect(html).not.toContain('Orion&#x27;s belt');
  });
  it('names the collected Alcyone star and provides a route back to stories', () => {
    const html = render(<IllustratedEnding data={data} />);
    expect(html).toContain('Added to My sky'); expect(html).toContain('>Alcyone</h1>');
    expect(html).toContain('href="/stories"');
    expect(html).toContain('Glaux the owl, proud');
    expect(html).not.toContain('right on the first try');
  });
});
