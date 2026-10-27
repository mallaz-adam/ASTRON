import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../App';
import { ProgressProvider } from '../hooks/useProgress';
import { UpdateNoticeView } from '../pwa/UpdateNotice';
import { TestTools } from './TestTools';
import { confirmProgressErasure } from '../logic/testTools';

function route(path: string, development: boolean) {
  return renderToStaticMarkup(<ProgressProvider><MemoryRouter initialEntries={[path]}><AppRoutes development={development} /></MemoryRouter></ProgressProvider>);
}
describe('The web test edition', () => {
  it.each(['/dev', '/design', '/missing'])('shows the normal not-found page at %s in production', path => {
    const html = route(path, false);
    expect(html).toContain('<h1>not found</h1>');
    expect(html).not.toContain('Rules under a small sky'); expect(html).not.toContain('FIELD SHEET');
  });
  it('keeps the local developer pages available in development', () => {
    expect(route('/dev', true)).toContain('Rules under a small sky');
    expect(route('/design', true)).toContain('Design check');
  });
  it('shows only the supplied update words when an update is actually ready', () => {
    expect(renderToStaticMarkup(<UpdateNoticeView />)).toBe('');
    const html = renderToStaticMarkup(<UpdateNoticeView refresh={() => {}} />);
    expect(html).toContain('A new version is ready.'); expect(html).toContain('>REFRESH</button>');
    expect(html).toContain('aria-live="polite"');
  });
  it('explains temporary progress and uses a full-page restart link', () => {
    const html = renderToStaticMarkup(<TestTools />);
    expect(html).toContain('Test version 0.1');
    expect(html).toContain('Progress resets when you reopen or refresh.');
    expect(html).toContain('href="/start"');
    expect(html).toContain('Start from the beginning');
    expect(html).not.toContain('Erase my progress on this device');
  });
  it('makes the restart address available without requiring earlier progress', () => {
    expect(route('/start', false)).toContain('Opening the atlas');
    expect(route('/start', false)).not.toContain('<h1>not found</h1>');
  });
  it('never erases after cancellation, and calls the service only after confirmation', async () => {
    const erase = vi.fn(async () => {});
    expect(await confirmProgressErasure(() => false, erase)).toBe(false); expect(erase).not.toHaveBeenCalled();
    expect(await confirmProgressErasure(() => true, erase)).toBe(true); expect(erase).toHaveBeenCalledOnce();
  });
});
