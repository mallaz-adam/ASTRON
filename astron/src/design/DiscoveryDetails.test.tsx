import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DiscoveryDetailsView } from './DiscoveryDetails';

describe('Discoverable optional information', () => {
  it('keeps a native disclosure and a non-colour description of an unopened detail', () => {
    const html = renderToStaticMarkup(<DiscoveryDetailsView label="Another telling" explored={false} onExplore={() => undefined}><p>A story note.</p></DiscoveryDetailsView>);
    expect(html).toContain('<details'); expect(html).toContain('<summary');
    expect(html).toContain('Unopened detail.'); expect(html).toContain('data-unseen="true"');
    expect(html).toContain('class="discovery-hint">Tap to explore');
    expect(html).toContain('aria-hidden="true"'); expect(html).not.toContain('role="button"');
  });
  it('keeps opened content and its status available with reduced motion', () => {
    const html = renderToStaticMarkup(<DiscoveryDetailsView label="Another telling" explored reduceMotion onExplore={() => undefined}><p>A story note.</p></DiscoveryDetailsView>);
    expect(html).toContain('data-unseen="false"'); expect(html).toContain('data-reduce-motion="true"');
    expect(html).toContain('Previously opened detail.'); expect(html).toContain('<p>A story note.</p>');
    expect(html).not.toContain('Tap to explore');
  });
});
