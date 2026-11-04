import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { ProgressProvider } from '../hooks/useProgress';
import { ArticleCard, ArticleReadingView } from './Articles';

const content = sampleContent();
const article = content.articles.find(row => row.id === 'betelgeuse-colour')!;
const render = (element: React.ReactNode) => renderToStaticMarkup(<ProgressProvider><MemoryRouter>{element}</MemoryRouter></ProgressProvider>);

describe('Clear article actions and reading structure', () => {
  it('provides a real Read action before the image, with category, reading time and visible credit', () => {
    const html = render(<ArticleCard article={article} />);
    expect(html).toMatch(/<a[^>]*href="\/articles\/betelgeuse-colour"[^>]*>Read the article<\/a>/);
    expect(html.indexOf('>Read the article</a>')).toBeLessThan(html.indexOf('<figure'));
    expect(html).toContain('Stars'); expect(html).toContain('2 min read');
    expect(html).toContain('ALMA'); expect(html).toContain('CC BY 4.0');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain('aria-hidden="true">Read the article');
  });
  it('links every outline action to a real, keyboard-focusable section heading and preserves every paragraph once', () => {
    const html = render(<ArticleReadingView article={article} saved={false} saving={false} onFinish={() => {}} />);
    expect(html).toContain('aria-label="In this article"');
    for (const section of article.sections!) {
      const id = `article-${article.id}-${section.id}`;
      expect(html).toContain(`href="#${id}"`);
      expect(html).toContain(`id="${id}" tabindex="-1"`);
    }
    for (const paragraph of article.body.split('\n\n')) {
      const text = renderToStaticMarkup(<p>{paragraph}</p>);
      expect(html.split(text)).toHaveLength(2);
    }
    expect(html).toContain('href="#article-title"');
    expect(html).toContain('>All articles</a>');
    expect(html).toContain('fetchPriority="high"');
  });
  it('keeps the read confirmation and meaningful exploration buttons after completion', () => {
    const html = render(<ArticleReadingView article={article} saved saving={false} onFinish={() => {}} />);
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Article read<\/button>/);
    expect(html).toContain('role="status"');
    expect(html).toMatch(/<a[^>]*class="atlas-button[^>]*href="\/stories\/orion-shoulder\?again"/);
    expect(html).toContain('>Explore how stars live and die</a>');
  });
  it('still reads older articles without sections or a cover', () => {
    const old = content.articles.find(row => row.id === 'looking-slowly')!;
    const html = render(<ArticleReadingView article={old} saved={false} saving={false} onFinish={() => {}} />);
    expect(html).toContain('You do not have to learn the whole sky at once.');
    expect(html).not.toContain('aria-label="In this article"');
  });
});
