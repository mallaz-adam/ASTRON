import 'fake-indexeddb/auto';
import { readFileSync, statSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { AstronDb } from './db';
import { sampleContent, sampleFiles } from './contentFixtures';
import { validateContent } from './contentLoader';
import { loadVisualUnit, validateVisualUnit } from './visualUnit';
import { finishReadingLesson } from './lessonServices';
import { buildCoursePath } from '../logic/coursePath';
import { readProgress } from './progressServices';
import { totalXp } from '../logic/xp';

const content = sampleContent();
const lesson = content.lessons.find(l => l.id === 'unit-earth-sun-moon')!;
const raw = () => JSON.parse(readFileSync(new URL('../../public/content/earth-sun-moon.json', import.meta.url), 'utf8'));
const databases: AstronDb[] = [];
afterEach(async () => { for (const database of databases.splice(0)) await database.delete(); });

describe('Earth, the Sun and the Moon: authored unit', () => {
  it('starts the beginner chapter, retaining older lessons and marking unwritten units as forthcoming', () => {
    const path = buildCoursePath(content, { completions: [] }, 'reader', undefined, true);
    expect(path.unit).toMatchObject({ title: 'Our place in space', orderNo: 1 });
    expect(path.cells.map(cell => cell.id)).toEqual(['earth-sun-moon']);
    expect(path.upcoming.map(cell => cell.title)).toEqual(['Our solar system', 'Stars and the Milky Way', 'Galaxies and the universe', 'Understanding sizes and distances', 'Light takes time to travel']);
    expect(buildCoursePath(content, { completions: [] }, 'reader', 'first-sky', true).cells.map(cell => cell.id)).toEqual(['orion-lesson', 'star-lesson', 'orion-tale']);
  });
  it('has ten connected teaching steps, eight definitions and two ungraded practices', () => {
    const unit = validateVisualUnit(raw(), lesson);
    expect(unit.steps).toHaveLength(10);
    expect(unit.glossary).toHaveLength(8);
    expect(unit.choice.correct).toBe('B');
    expect(unit.steps.flatMap(s => s.paragraphs).join(' ')).toContain('Moonlight is sunlight reflected');
    expect(lesson.cards.some(card => card.kind === 'exercise')).toBe(false);
  });
  it('ships small local pictures, with descriptions, original sources and credits for offline use', () => {
    for (const picture of validateVisualUnit(raw(), lesson).objects) {
      expect(statSync(new URL(`../../public${picture.src}`, import.meta.url)).size).toBeLessThan(100_000);
      expect(picture.credit).toContain('NASA');
      expect(picture.source).toMatch(/^https:\/\/science.nasa.gov\//);
      expect(picture.alt.length).toBeGreaterThan(30);
    }
    expect(readFileSync(new URL('../../vite.config.ts', import.meta.url), 'utf8')).toContain('webp');
  });
  it.each(['wrong lesson', 'duplicate steps', 'missing feedback', 'remote picture', 'unknown term', 'bad answer'])('rejects %s before displaying the lesson', reason => {
    const unit = raw();
    if (reason === 'wrong lesson') unit.lessonId = 'another';
    if (reason === 'duplicate steps') unit.steps[1].id = unit.steps[0].id;
    if (reason === 'missing feedback') delete unit.matching.feedback.earth.star;
    if (reason === 'remote picture') unit.objects[0].src = 'https://example.com/earth.webp';
    if (reason === 'unknown term') unit.steps[0].terms = ['mystery'];
    if (reason === 'bad answer') unit.choice.correct = 'missing';
    expect(() => validateVisualUnit(unit, lesson)).toThrow();
  });
  it('loads only the declared local JSON and gives a readable error on HTTP failure', async () => {
    let path = '';
    const unit = await loadVisualUnit(lesson, async input => { path = String(input); return new Response(JSON.stringify(raw())); });
    expect(path).toBe('/content/earth-sun-moon.json');
    expect(unit.title).toBe(lesson.title);
    await expect(loadVisualUnit(lesson, async () => new Response('', { status: 404 }))).rejects.toThrow('could not be loaded');
  });
  it('rejects a visual reader without local content in the shared content schema', () => {
    const files = sampleFiles();
    const row = (files.lessons as { id: string; reader?: string }[]).find(l => l.id === lesson.id)!;
    delete row.reader;
    expect(() => validateContent(files)).toThrow('readerType');
  });
  it('finishes with optional practice skipped, grants Learn once and never fabricates later units or exam scores', async () => {
    const database = new AstronDb(`visual-unit-${Date.now()}`); databases.push(database);
    const now = new Date('2026-10-29T12:00:00');
    const results = await Promise.all([finishReadingLesson(database, content, 'reader', lesson.id, now), finishReadingLesson(database, content, 'reader', lesson.id, now)]);
    expect(results.filter(r => r.learnQuestEarned)).toHaveLength(1);
    const progress = await readProgress(database);
    expect(progress.completions).toMatchObject([{ cellId: 'earth-sun-moon', correctAnswers: 0, xpEarned: 0 }]);
    expect(progress.answers).toEqual([]);
    expect(totalXp(progress.completions, progress.questDone, progress.answers, content.exercises)).toBe(20);
    await finishReadingLesson(database, content, 'reader', lesson.id, new Date('2026-10-30T12:00:00'));
    expect(await readProgress(database)).toEqual(progress);
    expect(buildCoursePath(content, progress, 'reader', undefined, true).current).toBeNull();
  });
});
