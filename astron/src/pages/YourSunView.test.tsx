import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import type { Progress } from '../data/types';
import { defaultLearner, localLearnerId } from '../data/learner';
import { buildSunModel } from '../logic/sun';
import { YourSunView } from './YourSunView';

function render(reduceMotion = false) {
  const progress: Progress = { learners: [{ ...defaultLearner(localLearnerId), reduceMotion }], activityDays: [], questDone: [], completions: [], answers: [], articleReads: [], litStars: [], learnerInterests: [] };
  const model = buildSunModel(progress, sampleContent(), new Date('2026-10-14T12:00:00'));
  return renderToStaticMarkup(<MemoryRouter initialEntries={['/sun']}><YourSunView model={model} /></MemoryRouter>);
}

describe('Your sun accessible view', () => {
  it('provides a native Back to Today link and a real SVG description', () => {
    const html = render();
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Back to Today<\/a>/);
    expect(html).toContain('viewBox="0 0 318 318" role="img" aria-label="Your sun: a streak of 0 days.');
    expect(html).toContain('<desc>Your sun:');
  });
  it('shows four supplied tier drawings and the proud owl, without selecting a tier at zero', () => {
    const html = render();
    expect(html.match(/class="inline-art tier-art"/g)).toHaveLength(4);
    expect(html).toContain('Glaux the owl, proud');
    expect(html).not.toContain('sun-tier--current');
    expect(html).toContain('1 ready');
  });
  it('exposes the saved motion setting and keeps seven labelled rays', () => {
    const html = render(true);
    expect(html).toContain('data-reduce-motion="true"');
    expect(html.match(/data-date=/g)).toHaveLength(7);
    expect(html).toContain('dial-ray--notYet');
    expect(html).not.toContain('dial-ray-gold');
  });
});
