import 'fake-indexeddb/auto';
import { readFileSync, statSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { loadSolarSystemUnit, planetIds, validateSolarSystemUnit } from './solarSystemUnit';
import { sampleContent } from './contentFixtures';
import { AstronDb } from './db';
import { finishReadingLesson } from './lessonServices';
import { readProgress } from './progressServices';
import { totalXp } from '../logic/xp';
import { nextReadingDestination } from '../logic/readingFlow';
import { buildCoursePath } from '../logic/coursePath';

const content = sampleContent();
const lesson = content.lessons.find(l => l.id === 'unit-our-solar-system')!;
const raw = () => JSON.parse(readFileSync(new URL('../../public/content/our-solar-system.json', import.meta.url), 'utf8'));
const databases: AstronDb[] = [];
afterEach(async () => { for (const database of databases.splice(0)) await database.delete(); });

describe('Our solar system: authored unit and progression', () => {
  it('has ten scenes, the approved lighter order practice and seven object classifications', () => {
    const data = validateSolarSystemUnit(raw(), lesson);
    expect(data.steps).toHaveLength(10);
    expect(data.orderPractice.correctOrder).toEqual(['mercury', 'venus', 'earth', 'mars']);
    expect(data.sorting.cards).toHaveLength(7);
    expect(data.objects.filter(image => planetIds.includes(image.id as typeof planetIds[number]))).toHaveLength(8);
    const pluto = data.steps.find(s => s.scene === 'pluto')!;
    expect(pluto.paragraphs.join(' ')).not.toContain('cleared');
    expect(data.plutoDetail.join(' ')).toMatch(/does not mean.+completely empty/);
    expect(lesson.cards.some(c => c.kind === 'exercise')).toBe(false);
  });
  it('ships described local media with source captions and preserves the Jupiter processor credit', () => {
    const data = validateSolarSystemUnit(raw(), lesson);
    let total = 0;
    for (const image of data.objects) {
      const size = statSync(new URL(`../../public${image.src}`, import.meta.url)).size;
      expect(size).toBeLessThan(100_000); total += size;
      expect(image.source).toMatch(/^https:\/\/science.nasa.gov\//);
      expect(image.alt.length).toBeGreaterThan(25);
    }
    expect(total).toBeLessThan(500_000);
    expect(data.objects.find(i => i.id === 'jupiter')).toMatchObject({ credit: expect.stringContaining('Jackie Branc'), license: expect.stringContaining('CC BY') });
    expect(data.objects.find(i => i.id === 'saturn')!.caption).toContain('composite');
    expect(data.objects.find(i => i.id === 'pluto')!.caption).toContain('enhanced');
  });
  it.each(['wrong identity', 'bad scene order', 'unknown term', 'external media', 'bad planet order', 'missing feedback', 'wrong group', 'format tags'])('rejects %s before rendering', reason => {
    const data = raw();
    if (reason === 'wrong identity') data.unitNumber = 3;
    if (reason === 'bad scene order') data.steps.reverse();
    if (reason === 'unknown term') data.steps[0].terms = ['unknown'];
    if (reason === 'external media') data.objects[0].src = 'https://example.com/photo.webp';
    if (reason === 'bad planet order') data.orderPractice.correctOrder.reverse();
    if (reason === 'missing feedback') data.orderPractice.feedback.pop();
    if (reason === 'wrong group') data.sorting.cards[0].group = 'planet';
    if (reason === 'format tags') data.glossary[0].example = '<font>example</font>';
    expect(() => validateSolarSystemUnit(data, lesson)).toThrow();
  });
  it('loads only the declared local JSON and reports a failed request', async () => {
    let requested = '';
    await loadSolarSystemUnit(lesson, async url => { requested = String(url); return new Response(JSON.stringify(raw())); });
    expect(requested).toBe('/content/our-solar-system.json');
    await expect(loadSolarSystemUnit(lesson, async () => new Response('', { status: 404 }))).rejects.toThrow('could not be loaded');
    await expect(loadSolarSystemUnit({ ...lesson, reader: 'https://example.com/unit.json' })).rejects.toThrow('local content');
  });
  it('requires Unit 1, continues directly to Unit 2, and completes without practice answers or extra rewards', async () => {
    const database = new AstronDb(`solar-unit-${Date.now()}`); databases.push(database);
    const learner = 'solar-reader'; const now = new Date('2026-10-30T12:00:00');
    await expect(finishReadingLesson(database, content, learner, lesson.id, now)).rejects.toThrow('Finish the cell before');
    expect(await database.completions.count()).toBe(0);
    await finishReadingLesson(database, content, learner, 'unit-earth-sun-moon', now);
    let progress = await readProgress(database);
    expect(nextReadingDestination(content, progress, learner, 'earth-sun-moon')).toEqual({ to: '/cell/our-solar-system', title: 'Our solar system' });
    expect(buildCoursePath(content, progress, learner, undefined, true).cells[1].state).toBe('current');
    await Promise.all([finishReadingLesson(database, content, learner, lesson.id, now), finishReadingLesson(database, content, learner, lesson.id, now)]);
    progress = await readProgress(database);
    expect(progress.completions.map(c => c.cellId).sort()).toEqual(['earth-sun-moon', 'our-solar-system']);
    expect(progress.completions.every(c => c.correctAnswers === 0 && c.xpEarned === 0)).toBe(true);
    expect(progress.answers).toEqual([]);
    expect(progress.litStars).toEqual([]);
    expect(totalXp(progress.completions, progress.questDone, progress.answers, content.exercises)).toBe(20);
    expect(nextReadingDestination(content, progress, learner, lesson.cellId)).toEqual({ to: '/learn', title: 'Back to the path' });
    await finishReadingLesson(database, content, learner, lesson.id, new Date('2026-10-31T12:00:00'));
    expect(await readProgress(database)).toEqual(progress);
    expect(buildCoursePath(content, progress, learner, undefined, true).countText).toBe('2 of 6 units done');
    expect(buildCoursePath(content, progress, learner, undefined, true).upcoming).toHaveLength(4);
  });
});
