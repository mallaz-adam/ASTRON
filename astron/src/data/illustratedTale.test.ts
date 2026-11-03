import 'fake-indexeddb/auto';
import { readFileSync, statSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AstronDb } from './db';
import { sampleContent, sampleFiles } from './contentFixtures';
import { validateContent } from './contentLoader';
import { loadTaleExperience, validateTaleExperience, type IllustratedTaleData } from './taleExperience';
import { advanceTaleVisit, answerBeltActivity, collectTaleStar, previousTaleChapter, startTaleVisit } from './taleServices';
import { readProgress, setReduceMotion } from './services';
import { totalXp } from '../logic/xp';

const content = sampleContent();
const taleId = 'pleiades-placeholder';
const raw = () => JSON.parse(readFileSync(new URL('../../public/content/pleiades.json', import.meta.url), 'utf8'));
const data = validateTaleExperience(raw()) as IllustratedTaleData;
const now = new Date('2026-11-03T12:00:00');
let database: AstronDb; let sequence = 0;
beforeEach(() => { database = new AstronDb(`astron-pleiades-${sequence++}`); });
afterEach(async () => { vi.restoreAllMocks(); await database.delete(); });
async function readTale(id = taleId) {
  await startTaleVisit(database, content, 'reader', id, now, { restart: true });
  for (const _chapter of content.chapters.filter(row => row.taleId === id)) await advanceTaleVisit(database, content, 'reader', id);
}
async function xp() {
  const saved = await readProgress(database);
  return totalXp(saved.completions, saved.questDone, saved.answers, content.exercises);
}

describe('The reviewed Pleiades manuscript', () => {
  it('joins seven complete scenes to the existing tale, course cell and Alcyone record', () => {
    const tale = content.tales.find(row => row.id === taleId)!;
    expect(tale).toMatchObject({ reader: '/content/pleiades.json', readerType: 'illustrated', starId: 'alcyone' });
    const chapters = content.chapters.filter(row => row.taleId === taleId);
    expect(chapters.map(chapter => chapter.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(data.scenes.map(scene => scene.number)).toEqual(chapters.map(chapter => chapter.number));
    expect(chapters.every(chapter => !chapter.text.includes('Placeholder'))).toBe(true);
    expect(content.cells.find(row => row.id === 'pleiades-tale')?.taleId).toBe(taleId);
    expect(data.epilogue.discoveries).toHaveLength(2);
    expect('activity' in data).toBe(false);
  });
  it('ships all artwork locally, with captions, credits and bounded download sizes', () => {
    const assets = [data.cover, ...data.scenes.map(scene => scene.artwork), data.epilogue.photograph, data.epilogue.pattern];
    for (const artwork of assets) {
      const size = statSync(new URL(`../../public${artwork.src}`, import.meta.url)).size;
      expect(size).toBeGreaterThan(0); expect(size).toBeLessThan(180_000);
      expect(artwork.alt.length).toBeGreaterThan(30);
    }
    expect(data.epilogue.photograph.credit).toBe('ESO/S. Brunier');
    expect(data.epilogue.pattern.caption).toContain('not a sky-finding chart');
  });
  it.each([
    ['unsafe local artwork', (value: any) => { value.scenes[0].artwork.src = 'https://example.com/tracker.svg'; }, 'artwork.src'],
    ['missing alt text', (value: any) => { value.cover.alt = ''; }, 'cover.alt'],
    ['unsafe attribution', (value: any) => { value.cover.source = 'javascript:alert(1)'; }, 'cover.source'],
    ['zero image dimensions', (value: any) => { value.cover.width = 0; }, 'cover.width'],
    ['duplicate scene', (value: any) => { value.scenes[1].number = 1; }, 'scenes[1].number'],
    ['duplicate discovery', (value: any) => { value.epilogue.discoveries[1].id = value.epilogue.discoveries[0].id; }, 'epilogue.discoveries'],
    ['a disguised Orion activity', (value: any) => { value.activity = {}; }, 'Orion activity'],
  ])('rejects %s before rendering', (_name, change, field) => {
    const value = raw(); change(value); expect(() => validateTaleExperience(value)).toThrow(field);
  });
  it('loads through the shared reader and reports unavailable files', async () => {
    await expect(loadTaleExperience('/content/pleiades.json', async () => new Response(JSON.stringify(raw())))).resolves.toMatchObject({ kind: 'illustrated' });
    await expect(loadTaleExperience('/content/pleiades.json', async () => new Response('', { status: 404 }))).rejects.toThrow('could not be loaded');
    await expect(loadTaleExperience('/content/pleiades.json', async () => new Response('{broken'))).rejects.toThrow('/content/pleiades.json: invalid JSON');
  });
  it('requires an accessible description for a story library cover', () => {
    const files = sampleFiles();
    delete (files.tales as Record<string, unknown>[])[1].coverAlt;
    expect(() => validateContent(files)).toThrow('tales.json: [1].coverAlt');
  });
});

describe('A story ending without an Orion quiz', () => {
  it('requires the whole story before collection, and returns to an earlier scene without losing preferences', async () => {
    await startTaleVisit(database, content, 'reader', taleId, now);
    await expect(collectTaleStar(database, content, 'reader', taleId, now)).rejects.toThrow('Read the story');
    await advanceTaleVisit(database, content, 'reader', taleId);
    await setReduceMotion(database, 'reader', true);
    await previousTaleChapter(database, 'reader', taleId);
    database.close(); await database.open();
    const visit = await startTaleVisit(database, content, 'reader', taleId, now);
    expect(visit).toMatchObject({ chapter: 1, stage: 'story' });
    expect((await database.learners.get('reader'))?.reduceMotion).toBe(true);
    expect(await xp()).toBe(0);
  });
  it('lights Alcyone once and goes straight to the ending without an exercise or fabricated prerequisites', async () => {
    await readTale();
    expect((await database.learners.get('reader'))?.taleVisit).toMatchObject({ stage: 'star', chapter: 7, readThrough: true });
    await Promise.all([1, 2].map(() => collectTaleStar(database, content, 'reader', taleId, now)));
    const saved = await readProgress(database);
    expect(saved.learners[0].taleVisit).toMatchObject({ stage: 'sky', taleId });
    expect(saved.learners[0].taleVisit?.beltOutcome).toBeUndefined();
    expect(saved.litStars).toMatchObject([{ starId: 'alcyone', how: 'tale' }]);
    expect(saved.completions.map(row => row.cellId)).toEqual(['pleiades-tale']);
    expect(saved.questDone.map(row => row.questId).sort()).toEqual(['daily-learn', 'daily-story']);
    expect(saved.answers).toHaveLength(0);
    expect(await xp()).toBe(35);
    await expect(answerBeltActivity(database, content, 'reader', taleId, 'show-me')).rejects.toThrow('before this activity');
  });
  it('replays without duplicating XP or stars and preserves an earlier Orion star', async () => {
    await readTale('orion-shoulder');
    await collectTaleStar(database, content, 'reader', 'orion-shoulder', now);
    await readTale(); await collectTaleStar(database, content, 'reader', taleId, now);
    await readTale(); await collectTaleStar(database, content, 'reader', taleId, now);
    database.close(); await database.open();
    const saved = await readProgress(database);
    expect(saved.litStars.map(row => row.starId).sort()).toEqual(['alcyone', 'betelgeuse']);
    expect(saved.completions).toHaveLength(2);
    expect(await xp()).toBe(35);
    expect(saved.learners[0].taleVisit?.stage).toBe('sky');
  });
  it('rolls back the completion and quests if Alcyone cannot be saved', async () => {
    await readTale();
    vi.spyOn(database.litStars, 'add').mockRejectedValueOnce(new Error('Storage full'));
    await expect(collectTaleStar(database, content, 'reader', taleId, now)).rejects.toThrow('Storage full');
    expect(await database.completions.count()).toBe(0);
    expect(await database.questDone.count()).toBe(0);
    expect((await database.learners.get('reader'))?.taleVisit?.stage).toBe('star');
  });
});
