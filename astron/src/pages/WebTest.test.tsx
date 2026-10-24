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
  it('uses a native erase control with the test version label', () => {
    const html = renderToStaticMarkup(<TestTools />);
    expect(html).toContain('Test version 0.1'); expect(html).toContain('type="button"');
    expect(html).toContain('Erase my progress on this device');
  });
  it('never erases after cancellation, and calls the service only after confirmation', async () => {
    const erase = vi.fn(async () => {});
    expect(await confirmProgressErasure(() => false, erase)).toBe(false); expect(erase).not.toHaveBeenCalled();
    expect(await confirmProgressErasure(() => true, erase)).toBe(true); expect(erase).toHaveBeenCalledOnce();
  });
});
