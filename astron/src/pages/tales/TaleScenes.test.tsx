import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../../data/contentFixtures';
import { validateTaleExperience } from '../../data/taleExperience';
import { BeltActivity } from './BeltActivity';
import { TaleChapter, TaleCover, TaleStar } from './TaleScenes';
import { ReadingText } from './TaleCommon';
import { OrionChart } from './OrionChart';
import { ProgressProvider } from '../../hooks/useProgress';

const content = sampleContent();
const data = validateTaleExperience(JSON.parse(readFileSync(new URL('../../../public/content/orion.json', import.meta.url), 'utf8')));
const tale = content.tales.find(row => row.id === data.taleId)!;
const render = (element: React.ReactNode) => renderToStaticMarkup(<ProgressProvider><MemoryRouter>{element}</MemoryRouter></ProgressProvider>);

describe('Orion reading and activity states', () => {
  it('uses the approved responsive painting asset and a real start button', () => {
    const html = render(<TaleCover tale={tale} data={data} resume={false} busy={false} onBegin={() => undefined} />);
    expect(html).toContain('/art/orion/cover-640.webp'); expect(html).toContain('1086w');
    expect(html).toContain('Begin the story'); expect(html).toContain('Walk with me. We will begin with a story.');
    expect(html.indexOf('>Begin the story</button>')).toBeLessThan(html.indexOf('class="tale-glaux"'));
    expect(html).toContain('fetchPriority="high"'); expect(html).toContain('decoding="async"');
    expect(html).toContain('data-emphasis="quiet"');
    expect(html).not.toContain('TEMPORARY');
  });
  it('retains the complete chapter prose and supplied hunter rather than replacing them with short speech cards', () => {
    const chapter = content.chapters.find(row => row.taleId === tale.id && row.number === 1)!;
    const html = render(<TaleChapter chapter={chapter} data={data} />);
    expect(html).toContain('/art/orion/hunter.webp'); expect(html).toContain('Each hunt made him more sure of his strength.');
    expect(html).toContain('A pattern to remember');
  });
  it('introduces every chapter before its picture without losing or repeating any approved paragraph', () => {
    for (const chapter of content.chapters.filter(row => row.taleId === tale.id)) {
      const html = render(<TaleChapter chapter={chapter} data={data} />);
      const paragraphs = chapter.text.split(/\n\s*\n/).map(text => renderToStaticMarkup(<p>{text.replace(/\n/g, ' ')}</p>));
      expect(html.indexOf(paragraphs[0])).toBeLessThan(html.indexOf('<aside'));
      for (const paragraph of paragraphs) expect(html.split(paragraph)).toHaveLength(2);
    }
  });
  it('starts with three native radio choices and immediate help, without an enabled Check', () => {
    const html = render(<BeltActivity data={data} busy={false} onAnswer={async () => false} onContinue={() => undefined} />);
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    expect(html).toContain('Group B. Three close stars in an almost-straight line.');
    expect(html).toContain('>Hint</button>'); expect(html).toContain('>Show me</button>');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Check<\/button>/);
  });
  it('shows the taught belt group selected after help and permits continuing', () => {
    const html = render(<BeltActivity data={data} outcome="assisted" busy={false} onAnswer={async () => true} onContinue={() => undefined} />);
    const belt = html.match(/<input[^>]*>/g)!.find(input => input.includes('value="belt"'))!;
    expect(belt).toContain('checked=""'); expect(html).toContain(data.activity.explanation.replaceAll("'", '&#x27;'));
    expect(html).toContain('>Continue</button>'); expect(html).not.toContain('>Check</button>');
  });
  it('gives the specific proud response after recognition and no score line', () => {
    const html = render(<BeltActivity data={data} outcome="independent" busy={false} onAnswer={async () => true} onContinue={() => undefined} />);
    expect(html).toContain(data.activity.rightLine); expect(html).toContain('Glaux the owl, proud');
    expect(html).not.toContain('right on the first try');
  });
  it('puts the collected star’s name before its chart in mobile reading order', () => {
    const html = render(<TaleStar tale={tale} data={data} collected ending />);
    expect(html.indexOf('id="star-title"')).toBeLessThan(html.indexOf('<figure'));
    const fact = renderToStaticMarkup(<p>{data.fact}</p>);
    expect(html.indexOf(fact)).toBeLessThan(html.indexOf('<figure'));
    expect(html.split(fact)).toHaveLength(2);
    expect(html).toContain('Added to My sky'); expect(html).toContain(data.endingQuestion);
  });
  it('keeps the unassisted chart description neutral and provides a meaningful image description', () => {
    const html = render(<OrionChart data={data} activity connections={false} />);
    expect(html).toContain('role="img"'); expect(html).toContain('Seven selected stars from Orion.');
    expect(html).not.toContain('Two stars mark the shoulders');
  });
  it('renders manuscript text as text rather than executable HTML', () => {
    const html = render(<ReadingText text={'<script>alert(1)</script>\n\nA second paragraph.'} />);
    expect(html).not.toContain('<script>'); expect(html).toContain('&lt;script&gt;');
    expect(html.match(/<p>/g)).toHaveLength(2);
  });
});
