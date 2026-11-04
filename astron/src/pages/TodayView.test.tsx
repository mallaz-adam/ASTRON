import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import type { Progress } from '../data/types';
import { defaultLearner, localLearnerId } from '../data/learner';
import { atLocalNoon } from '../logic/dates';
import { buildTodayModel } from '../logic/today';
import { TodayView } from './TodayView';

function render(reduceMotion = false, showDevLink = false) {
  const saved: Progress = { learners: [{ ...defaultLearner(localLearnerId), reduceMotion }], learnerInterests: [], activityDays: [], questDone: [], completions: [], answers: [], litStars: [], articleReads: [] };
  const model = buildTodayModel(saved, sampleContent(), atLocalNoon('2026-10-13'));
  return renderToStaticMarkup(<MemoryRouter><TodayView model={model} showDevLink={showDevLink} /></MemoryRouter>);
}

describe('Today controls and art', () => {
  it('has a native Profile button and a current Today link', () => {
    const html = render();
    expect(html).toContain('type="button" class="profile-control" aria-label="Profile"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('Continue learning');
    expect(html).toContain('Earth, the Sun and the Moon');
    expect(html.indexOf('today-continue')).toBeLessThan(html.indexOf('streak-card'));
  });
  it('links all five working destinations without an unavailable placeholder', () => {
    const html = render();
    expect(html).not.toContain('aria-disabled="true"');
    expect(html).toContain('href="/learn"');
    expect(html).toContain('href="/articles"');
    expect(html).toContain('href="/stories"');
    expect(html).not.toContain('href="/timeline"');
    expect(html).toContain('href="/sky"');
  });
  it('inlines the supplied sun and owl and exposes the motion preference', () => {
    const html = render(true);
    expect(html).toContain('data-reduce-motion="true"');
    expect(html).toContain('class="rays"');
    expect(html).toContain('class="head"');
    expect(html).toContain('class="eye"');
    expect(html).toContain('aria-label="Glaux the owl, happy"');
  });
  it('includes the dev link only when the development flag is supplied', () => {
    expect(render()).not.toContain('href="/dev"');
    expect(render(false, true)).toContain('href="/dev"');
  });
  it('links the complete streak card to Your sun with its requested label', () => {
    expect(render()).toMatch(/<a[^>]*class="streak-card"[^>]*aria-label="See your sun"[^>]*href="\/sun"/);
    expect(render()).toContain('navigation-wordmark">ASTRON');
  });
  it('prioritises learning and plain activity instructions while keeping XP in a closed disclosure', () => {
    const html = render();
    expect(html).toContain('href="/cell/earth-sun-moon"');
    expect(html.indexOf('today-continue')).toBeLessThan(html.indexOf('today-activities'));
    expect(html.indexOf('today-activities')).toBeLessThan(html.indexOf('streak-card'));
    expect(html).toContain('Stories also count towards Learn.');
    expect(html).toContain('Open an article, then choose Mark as read.');
    const details = html.match(/<details[^>]*class="today-rewards"[^>]*>/)![0];
    expect(details).not.toContain('open=');
    expect(html).toContain('Daily goal and XP');
    expect(html).not.toContain('class="quest-xp"');
  });
});
