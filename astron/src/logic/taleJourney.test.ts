import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { defaultLearner } from '../data/learner';
import type { Progress } from '../data/types';
import { sampleContent } from '../data/contentFixtures';
import { validateTaleExperience } from '../data/taleExperience';
import { evaluateBeltChoice, needsWelcome, readableTales } from './taleJourney';
import { projectOrion } from './orionChart';

const readerFile = () => JSON.parse(readFileSync(new URL('../../public/content/orion.json', import.meta.url), 'utf8'));
const data = validateTaleExperience(readerFile());
const empty = (): Progress => ({ learners: [defaultLearner('one')], learnerInterests: [], activityDays: [], questDone: [], completions: [], answers: [], litStars: [], articleReads: [] });

describe('First-visit routing', () => {
  it('welcomes a genuinely new device, including a default learner with only a day record', () => {
    const saved = empty(); saved.activityDays.push({ learnerId: 'one', dayDate: '2026-10-25', freezeUsed: false, dailyGoal: 2 });
    expect(needsWelcome(saved, 'one')).toBe(true);
  });
  it('preserves the ordinary home for existing learners and ignores another learner', () => {
    const saved = empty(); saved.litStars.push({ learnerId: 'one', starId: 'star-clue-03', litOn: '2026-10-24', how: 'lesson' });
    expect(needsWelcome(saved, 'one')).toBe(false);
    expect(needsWelcome(saved, 'someone-else')).toBe(true);
  });
  it('resumes an unfinished welcome even after the star has been earned', () => {
    const saved = empty(); saved.learners[0].welcome = { startedOn: '2026-10-25' };
    saved.litStars.push({ learnerId: 'one', starId: 'betelgeuse', litOn: '2026-10-25', how: 'tale' });
    expect(needsWelcome(saved, 'one')).toBe(true);
    saved.learners[0].welcome.completedOn = '2026-10-25';
    expect(needsWelcome(saved, 'one')).toBe(false);
  });
  it('exposes only authored tale readers and retains all four manuscript chapters', () => {
    const content = sampleContent();
    expect(readableTales(content).map(tale => tale.id)).toEqual(['orion-shoulder']);
    expect(content.chapters.filter(chapter => chapter.taleId === 'orion-shoulder')).toHaveLength(4);
  });
});

describe('The chart and belt activity', () => {
  it('accepts the belt group and rejects the two other patterns', () => {
    expect(evaluateBeltChoice('belt')).toBe(true); expect(evaluateBeltChoice('upper')).toBe(false); expect(evaluateBeltChoice('lower')).toBe(false);
  });
  it('projects the sourced positions north-up and east-left inside the chart', () => {
    const stars = new Map(data.chart.stars.map(star => [star.id, projectOrion(star)]));
    for (const point of stars.values()) { expect(point.x).toBeGreaterThan(20); expect(point.x).toBeLessThan(340); expect(point.y).toBeGreaterThan(20); expect(point.y).toBeLessThan(420); }
    expect(stars.get('betelgeuse')!.x).toBeLessThan(stars.get('bellatrix')!.x);
    expect(stars.get('rigel')!.x).toBeGreaterThan(stars.get('saiph')!.x);
    expect(stars.get('betelgeuse')!.y).toBeLessThan(stars.get('alnilam')!.y);
    expect(stars.get('rigel')!.y).toBeGreaterThan(stars.get('alnilam')!.y);
  });
  it('keeps the three belt stars close and almost aligned without moving them for touch targets', () => {
    const belt = ['alnitak', 'alnilam', 'mintaka'].map(id => projectOrion(data.chart.stars.find(star => star.id === id)!));
    const [a, b, c] = belt;
    const distanceToLine = Math.abs((c.y - a.y) * b.x - (c.x - a.x) * b.y + c.x * a.y - c.y * a.x) / Math.hypot(c.x - a.x, c.y - a.y);
    expect(distanceToLine).toBeLessThan(2);
    expect(Math.hypot(c.x - a.x, c.y - a.y)).toBeLessThan(60);
  });
  it('rejects malformed coordinates, broken links, false belt membership and unsafe sources', () => {
    const coordinates = readerFile(); coordinates.chart.stars[0].raDegrees = 'hours'; expect(() => validateTaleExperience(coordinates)).toThrow('raDegrees');
    const links = readerFile(); links.chart.connections[0][0] = 'missing'; expect(() => validateTaleExperience(links)).toThrow('connections');
    const belt = readerFile(); belt.activity.groups[1].starIds[0] = 'rigel'; expect(() => validateTaleExperience(belt)).toThrow('groups.belt');
    const sources = readerFile(); sources.sources[0].url = 'javascript:alert(1)'; expect(() => validateTaleExperience(sources)).toThrow('sources');
  });
});
