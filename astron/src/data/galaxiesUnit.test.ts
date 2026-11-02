import 'fake-indexeddb/auto';
import { readFileSync, statSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { loadGalaxiesUnit, validateGalaxiesUnit } from './galaxiesUnit';
import { sampleContent } from './contentFixtures';
import { AstronDb } from './db';
import { finishReadingLesson } from './lessonServices';
import { readProgress } from './progressServices';
import { buildCoursePath } from '../logic/coursePath';
import { nextReadingDestination } from '../logic/readingFlow';
import { totalXp } from '../logic/xp';

const content = sampleContent();
const lesson = content.lessons.find(l => l.id === 'unit-galaxies-universe')!;
const raw = () => JSON.parse(readFileSync(new URL('../../public/content/galaxies-universe.json', import.meta.url), 'utf8'));
const databases: AstronDb[] = [];
afterEach(async () => { for (const db of databases.splice(0)) await db.delete(); });

describe('Galaxies and the universe', () => {
  it('keeps a separate recap, meaningful definitions, source-matched media and the observational-limit explanation', () => {
    const unit = validateGalaxiesUnit(raw(), lesson);
    expect(lesson).toMatchObject({ placeholder: false, readerType: 'visual-unit', reader: '/content/galaxies-universe.json' });
    expect(unit.steps).toHaveLength(10); expect(unit.recap.paragraphs).toHaveLength(3);
    expect(unit.steps.find(s => s.scene === 'andromeda')!.paragraphs.join(' ')).toContain('Andromeda');
    expect(unit.steps.at(-1)!.paragraphs.join(' ')).toContain('Light needs time to travel');
    expect(unit.steps.at(-1)!.paragraphs.join(' ')).toContain('not a solid wall');
    expect(unit.evidence.questions.map(q => q.id)).toEqual(['panel-size', 'colour', 'outside-photo']);
    expect(lesson.cards.some(c => c.kind === 'exercise')).toBe(false);
    for (const step of unit.steps) for (const term of step.terms) {
      expect(step.paragraphs.join(' ').toLowerCase()).toContain(term);
      expect(unit.glossary.some(t => t.term === term)).toBe(true);
    }
  });
  it('ships small, correctly sized local images with full source, credit and licence metadata', () => {
    const unit = validateGalaxiesUnit(raw(), lesson);
    let addedBytes = 0;
    for (const image of unit.objects) {
      const path = new URL(`../../public${image.src}`, import.meta.url);
      const bytes = statSync(path).size;
      expect(bytes).toBeLessThan(110_000);
      expect(image.alt.length).toBeGreaterThan(30);
      expect(image.credit).toMatch(/ESA/);
      if (image.src.startsWith('/art/galaxies/')) addedBytes += bytes;
    }
    expect(addedBytes).toBeLessThan(300_000);
    expect(unit.objects.find(i => i.id === 'andromeda')!.mediaType).toContain('Ground-based');
    expect(unit.objects.find(i => i.id === 'milky-model')!.mediaType).toMatch(/reconstruction/i);
    expect(unit.objects.find(i => i.id === 'milky-model')!.src).toBe('/art/milky-way/galaxy-above.webp');
  });
  it.each(['wrong identity', 'scene order', 'missing recap', 'unknown definition', 'unlinked definition', 'remote media', 'duplicate media', 'false photo', 'missing credit', 'invalid answer', 'missing evidence feedback', 'NUL', 'replacement character', 'HTML'])('rejects %s before rendering', reason => {
    const unit = raw();
    if (reason === 'wrong identity') unit.unitNumber = 3;
    if (reason === 'scene order') unit.steps.reverse();
    if (reason === 'missing recap') delete unit.recap;
    if (reason === 'unknown definition') unit.glossary = [];
    if (reason === 'unlinked definition') unit.steps[0].terms = ['observable universe'];
    if (reason === 'remote media') unit.objects[0].src = 'https://example.com/a.webp';
    if (reason === 'duplicate media') unit.objects[0] = unit.objects[1];
    if (reason === 'false photo') unit.objects[4].mediaType = 'Telescope observation';
    if (reason === 'missing credit') delete unit.objects[1].credit;
    if (reason === 'invalid answer') unit.choice.correct = 'missing';
    if (reason === 'missing evidence feedback') unit.evidence.questions[0].options[0].feedback = '';
    if (reason === 'NUL') unit.steps[0].paragraphs[0] += '\u0000';
    if (reason === 'replacement character') unit.steps[0].paragraphs[0] += '\uFFFD';
    if (reason === 'HTML') unit.steps[0].paragraphs[0] = '<font>Example</font>';
    expect(() => validateGalaxiesUnit(unit, lesson)).toThrow();
  });
  it('loads local content and reports failed requests without accepting a remote manuscript', async () => {
    let requested = '';
    await loadGalaxiesUnit(lesson, async input => { requested = String(input); return new Response(JSON.stringify(raw())); });
    expect(requested).toBe('/content/galaxies-universe.json');
    await expect(loadGalaxiesUnit(lesson, async () => new Response('', { status: 404 }))).rejects.toThrow('could not be loaded');
    await expect(loadGalaxiesUnit({ ...lesson, reader: 'https://example.com/unit.json' })).rejects.toThrow('local content');
  });
  it('requires Unit 3, completes without assessment records, and never duplicates Learn XP or invents a fifth unit', async () => {
    const db = new AstronDb(`galaxies-${Date.now()}`); databases.push(db);
    const learner = 'galaxies-reader'; const now = new Date('2026-11-02T12:00:00');
    await expect(finishReadingLesson(db, content, learner, lesson.id, now)).rejects.toThrow('Finish the cell before');
    for (const id of ['unit-earth-sun-moon', 'unit-our-solar-system']) await finishReadingLesson(db, content, learner, id, now);
    await expect(finishReadingLesson(db, content, learner, lesson.id, now)).rejects.toThrow('Finish the cell before');
    await finishReadingLesson(db, content, learner, 'unit-stars-milky-way', now);
    let progress = await readProgress(db);
    expect(nextReadingDestination(content, progress, learner, 'stars-milky-way')).toEqual({ to: '/cell/galaxies-universe', title: 'Galaxies and the universe' });
    await Promise.all([finishReadingLesson(db, content, learner, lesson.id, now), finishReadingLesson(db, content, learner, lesson.id, now)]);
    progress = await readProgress(db);
    expect(progress.completions).toHaveLength(4);
    expect(progress.answers).toEqual([]); expect(progress.litStars).toEqual([]);
    expect(progress.completions.every(c => c.correctAnswers === 0 && c.xpEarned === 0)).toBe(true);
    expect(totalXp(progress.completions, progress.questDone, progress.answers, content.exercises)).toBe(20);
    const path = buildCoursePath(content, progress, learner, undefined, true);
    expect(path.countText).toBe('4 of 6 units done'); expect(path.upcoming.map(c => c.id)).toEqual(['sizes-distances', 'light-travel-time']);
    expect(nextReadingDestination(content, progress, learner, lesson.cellId)).toEqual({ to: '/learn', title: 'Back to the path' });
    await finishReadingLesson(db, content, learner, lesson.id, new Date('2026-11-03T12:00:00'));
    expect(await readProgress(db)).toEqual(progress);
  });
});
