import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { WelcomeView } from './Welcome';
import { TodayTabs } from './TodayTabs';

describe('Orientation and main navigation', () => {
  it('offers the first action before the optional orientation without dropping any learning area', () => {
    const html = renderToStaticMarkup(<MemoryRouter><WelcomeView onBegin={() => undefined} /></MemoryRouter>);
    for (const label of ['Learn', 'Stories', 'Articles']) expect(html).toContain(`<h2>${label}</h2>`);
    expect(html.indexOf('>Meet Orion</button>')).toBeLessThan(html.indexOf('<h2>Learn</h2>'));
    expect(html).toContain('No account is needed.');
    expect(html).toContain('Progress is temporary. Refresh to start from the beginning.');
  });
  it.each([['/', 'Today'], ['/learn', 'Learn'], ['/stories', 'Stories'], ['/articles', 'Articles'], ['/articles/betelgeuse-colour', 'Articles'], ['/sky', 'My sky']])('marks the correct destination for %s', (path, label) => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><TodayTabs /></MemoryRouter>);
    const active = html.match(/<a[^>]*aria-current="page"[^>]*>.*?<\/a>/g) ?? [];
    expect(active).toHaveLength(1); expect(active[0]).toContain(`<span>${label}</span>`);
    expect(html.match(/<a[^>]*class="today-tab(?: |")/g)).toHaveLength(5);
  });
});
