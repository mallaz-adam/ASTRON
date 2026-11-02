import 'fake-indexeddb/auto';
import { readFileSync, statSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { loadMilkyWayUnit, validateMilkyWayUnit } from './milkyWayUnit';
import { sampleContent } from './contentFixtures';
import { AstronDb } from './db';
import { finishReadingLesson } from './lessonServices';
import { readProgress } from './progressServices';
import { buildCoursePath } from '../logic/coursePath';
import { nextReadingDestination } from '../logic/readingFlow';
import { totalXp } from '../logic/xp';

const content = sampleContent();
const lesson = content.lessons.find(l => l.id === 'unit-stars-milky-way')!;
const raw = () => JSON.parse(readFileSync(new URL('../../public/content/stars-milky-way.json', import.meta.url), 'utf8'));
const databases: AstronDb[] = [];
afterEach(async () => { for (const db of databases.splice(0)) await db.delete(); });

describe('Stars and the Milky Way content and progression', () => {
  it('preserves ten teaching steps plus a separate three-point recap and the approved corrections', () => {
    const unit = validateMilkyWayUnit(raw(), lesson);
    expect(unit.steps).toHaveLength(10); expect(unit.recap.paragraphs).toHaveLength(3);
    expect(unit.steps[3].paragraphs).toContain('They may actually be far apart in space.');
    expect(unit.steps[2].paragraphs.join(' ')).toContain('brightness alone cannot tell');
    expect(unit.steps[7].paragraphs).toContain('You do not need to remember that name.');
    expect(unit.steps[1].paragraphs.join(' ')).not.toContain('disk');
    for (const step of unit.steps) for (const term of step.terms) {
      expect(step.paragraphs.join(' ').toLowerCase()).toContain(term);
      expect(unit.glossary.some(t => t.term === term)).toBe(true);
    }
    expect(lesson).toMatchObject({ placeholder: false, readerType: 'visual-unit', reader: '/content/stars-milky-way.json' });
    expect(lesson.cards.some(c => c.kind === 'exercise')).toBe(false);
  });
  it('ships six small local pictures with correct media types, credits, changes and licence links', () => {
    const unit = validateMilkyWayUnit(raw(), lesson);
    let bytes = 0;
    for (const image of unit.objects) {
      const size = statSync(new URL(`../../public${image.src}`, import.meta.url)).size;
      expect(size).toBeLessThan(100_000); bytes += size;
      expect(image.alt.length).toBeGreaterThan(30);
      expect(image.credit).toMatch(/ESA|ESO/);
      expect(image.licenseUrl).toMatch(/^https:\/\/creativecommons.org\//);
      expect(image.changes).toMatch(/esiz/);
    }
    expect(bytes).toBeLessThan(350_000);
    expect(unit.objects.find(i => i.id === 'galaxy-side')!.changes).toContain('Cropped');
    expect(unit.objects.find(i => i.id === 'galaxy-location')!.changes).toContain('original arrow retained');
    expect(unit.objects.find(i => i.id === 'panorama')!.caption).toContain('Seven photographic frames');
  });
  it.each(['identity', 'scene order', 'missing recap', 'missing definition', 'invisible term', 'remote image', 'duplicate media', 'false photo', 'missing licence', 'bad answer', 'bad match', 'missing feedback', 'NUL', 'HTML'])('rejects %s before rendering', reason => {
    const unit = raw();
    if (reason === 'identity') unit.unitNumber = 2;
    if (reason === 'scene order') unit.steps.reverse();
    if (reason === 'missing recap') delete unit.recap;
    if (reason === 'missing definition') unit.glossary = [];
    if (reason === 'invisible term') unit.steps[0].terms = ['viewpoint'];
    if (reason === 'remote image') unit.objects[0].src = 'https://example.com/a.webp';
    if (reason === 'duplicate media') unit.objects[0] = unit.objects[1];
    if (reason === 'false photo') unit.objects[2].mediaType = 'Photograph';
    if (reason === 'missing licence') delete unit.objects[1].licenseUrl;
    if (reason === 'bad answer') unit.choice.correct = 'B';
    if (reason === 'bad match') unit.matching.cards[0].group = 'outside';
    if (reason === 'missing feedback') unit.matching.cards[0].feedback = '';
    if (reason === 'NUL') unit.steps[0].paragraphs[0] += '\u0000';
    if (reason === 'HTML') unit.glossary[0].definition = '<font>Example</font>';
    expect(() => validateMilkyWayUnit(unit, lesson)).toThrow();
  });
  it('loads the local manuscript and reports failed requests', async () => {
    let path = '';
    await loadMilkyWayUnit(lesson, async input => { path = String(input); return new Response(JSON.stringify(raw())); });
    expect(path).toBe('/content/stars-milky-way.json');
    await expect(loadMilkyWayUnit(lesson, async () => new Response('', { status: 404 }))).rejects.toThrow('could not be loaded');
    await expect(loadMilkyWayUnit({ ...lesson, reader: 'https://example.com/a.json' })).rejects.toThrow('local content');
  });
  it('unlocks after Unit 2 and completes with practice skipped, without duplicate rewards or an early exam', async () => {
    const db = new AstronDb(`milky-unit-${Date.now()}`); databases.push(db);
    const learner = 'milky-reader'; const now = new Date('2026-10-30T12:00:00');
    await expect(finishReadingLesson(db, content, learner, lesson.id, now)).rejects.toThrow('Finish the cell before');
    await finishReadingLesson(db, content, learner, 'unit-earth-sun-moon', now);
    await expect(finishReadingLesson(db, content, learner, lesson.id, now)).rejects.toThrow('Finish the cell before');
    await finishReadingLesson(db, content, learner, 'unit-our-solar-system', now);
    let progress = await readProgress(db);
    expect(nextReadingDestination(content, progress, learner, 'our-solar-system')).toEqual({ to: '/cell/stars-milky-way', title: 'Stars and the Milky Way' });
    expect(buildCoursePath(content, progress, learner, undefined, true).current?.id).toBe(lesson.cellId);
    await Promise.all([finishReadingLesson(db, content, learner, lesson.id, now), finishReadingLesson(db, content, learner, lesson.id, now)]);
    progress = await readProgress(db);
    expect(progress.completions).toHaveLength(3);
    expect(progress.completions.every(c => c.correctAnswers === 0 && c.xpEarned === 0)).toBe(true);
    expect(progress.answers).toEqual([]); expect(progress.litStars).toEqual([]);
    expect(totalXp(progress.completions, progress.questDone, progress.answers, content.exercises)).toBe(20);
    expect(nextReadingDestination(content, progress, learner, lesson.cellId)).toEqual({ to: '/cell/galaxies-universe', title: 'Galaxies and the universe' });
    const model = buildCoursePath(content, progress, learner, undefined, true);
    expect(model.countText).toBe('3 of 6 units done'); expect(model.upcoming).toHaveLength(2);
    expect(model.current?.id).toBe('galaxies-universe');
    expect(model.upcoming[0].id).toBe('sizes-distances');
    await finishReadingLesson(db, content, learner, lesson.id, new Date('2026-10-31T12:00:00'));
    expect(await readProgress(db)).toEqual(progress);
  });
});
