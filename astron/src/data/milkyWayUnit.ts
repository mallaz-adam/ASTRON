import { checkRows, object, text } from './contentSchema';
import type { Lesson } from './types';
import type { UnitTerm } from './visualUnit';

export const milkyScenes = ['night-sky', 'sun-star', 'brightness', 'star-depth', 'solar-group', 'galactic-home', 'galaxy-views', 'our-location', 'sky-band', 'two-views'] as const;
export type MilkyScene = typeof milkyScenes[number];
export const milkyImageIds = ['sky', 'sun-visible', 'galaxy-above', 'galaxy-side', 'galaxy-location', 'panorama'] as const;
export type MilkyImageId = typeof milkyImageIds[number];
export type MilkyStep = { id: string; title: string; scene: MilkyScene; paragraphs: string[]; terms: string[]; glaux?: string };
export type MilkyImage = {
  id: MilkyImageId; name: string; src: string; width: number; height: number;
  alt: string; caption: string; credit: string; source: string;
  mediaType: string; license: string; licenseUrl: string; changes: string;
};
export type MilkyWayUnitData = {
  lessonId: 'unit-stars-milky-way'; unitNumber: 3; chapter: string; title: string; introduction: string[];
  steps: MilkyStep[]; recap: { title: string; paragraphs: string[]; glaux: string };
  objects: MilkyImage[]; glossary: UnitTerm[];
  choice: { prompt: string; hint: string; explanation: string; correct: string; options: { id: string; text: string; feedback: string }[] };
  matching: { prompt: string; hint: string; right: string; groups: { id: string; label: string }[]; cards: { id: string; text: string; group: string; feedback: string }[] };
  sources: { title: string; url: string }[];
};

const strings = (v: unknown) => Array.isArray(v) && v.length > 0 && v.every(text);
const https = (v: unknown) => typeof v === 'string' && /^https:\/\//.test(v);

export function validateMilkyWayUnit(value: unknown, lesson: Pick<Lesson, 'id'>): MilkyWayUnitData {
  function fail(message: string): never { throw new Error(`Milky Way unit: ${message}`); }
  if (!object(value)) fail('expected an object.');
  const unit = value as MilkyWayUnitData;
  if (unit.lessonId !== 'unit-stars-milky-way' || unit.lessonId !== lesson.id || unit.unitNumber !== 3 || !text(unit.chapter) || !text(unit.title) || !strings(unit.introduction)) fail('invalid unit identity or introduction.');
  checkRows(unit.steps, { id: text, title: text, scene: v => milkyScenes.includes(v as MilkyScene), paragraphs: strings, terms: v => Array.isArray(v) && v.every(text), glaux: v => v === undefined || text(v) }, 'Milky Way steps');
  if (unit.steps.length !== 10 || new Set(unit.steps.map(s => s.id)).size !== 10 || unit.steps.map(s => s.scene).join() !== milkyScenes.join()) fail('expected ten distinct teaching scenes in order.');
  if (!unit.recap || !text(unit.recap.title) || !text(unit.recap.glaux) || !strings(unit.recap.paragraphs) || unit.recap.paragraphs.length !== 3) fail('expected a separate three-point recap.');
  checkRows(unit.glossary, { term: text, definition: text, example: text }, 'Milky Way glossary');
  if (new Set(unit.glossary.map(t => t.term)).size !== unit.glossary.length) fail('duplicate glossary term.');
  for (const step of unit.steps) {
    if (step.terms.length > 2 || new Set(step.terms).size !== step.terms.length || step.terms.some(term => !unit.glossary.some(entry => entry.term === term) || !step.paragraphs.join(' ').toLowerCase().includes(term))) fail('linked terms must occur in the step and have definitions, at most two.');
  }
  checkRows(unit.objects, {
    id: v => milkyImageIds.includes(v as MilkyImageId), name: text,
    src: v => typeof v === 'string' && /^\/art\/milky-way\/[a-z-]+\.webp$/.test(v),
    width: v => Number.isInteger(v) && Number(v) > 0, height: v => Number.isInteger(v) && Number(v) > 0,
    alt: text, caption: text, credit: text, source: https, mediaType: text, license: text, licenseUrl: https, changes: text,
  }, 'Milky Way pictures');
  if (unit.objects.length !== 6 || new Set(unit.objects.map(i => i.id)).size !== 6) fail('expected six distinct local pictures with provenance.');
  for (const image of unit.objects) {
    const model = image.id.startsWith('galaxy-');
    if (model && !/reconstruction/i.test(image.mediaType)) fail('outside galaxy views must be labelled as reconstructions.');
    if ((image.id === 'sky' || image.id === 'panorama') && !/photograph/i.test(image.mediaType)) fail('Earth views must be labelled as photographs.');
  }
  if (!unit.choice || ![unit.choice.prompt, unit.choice.hint, unit.choice.explanation].every(text)) fail('missing choice explanation.');
  checkRows(unit.choice.options, { id: text, text, feedback: text }, 'Milky Way choices');
  if (unit.choice.options.length !== 4 || new Set(unit.choice.options.map(o => o.id)).size !== 4 || unit.choice.correct !== 'A' || !unit.choice.options.some(o => o.id === unit.choice.correct)) fail('invalid connected explanation answer.');
  if (!unit.matching || ![unit.matching.prompt, unit.matching.hint, unit.matching.right].every(text)) fail('missing matching explanation.');
  checkRows(unit.matching.groups, { id: text, label: text }, 'Milky Way view groups');
  checkRows(unit.matching.cards, { id: text, text, group: v => ['earth', 'outside'].includes(String(v)), feedback: text }, 'Milky Way view cards');
  if (unit.matching.groups.map(g => g.id).join() !== 'earth,outside' || unit.matching.cards.length !== 4 || new Set(unit.matching.cards.map(c => c.id)).size !== 4 || unit.matching.cards.map(c => c.group).join() !== 'earth,outside,earth,outside') fail('invalid viewpoint matching.');
  checkRows(unit.sources, { title: text, url: https }, 'Milky Way sources');
  // PDF export boxes/NULs and production markup must never reach learner copy.
  if (/\\u0000|\uFFFD|<\/?[a-z][^>]*>/i.test(JSON.stringify(unit))) fail('remove PDF export characters or formatting tags.');
  return unit;
}

export function isMilkyWayUnit(data: { lessonId: string }): data is MilkyWayUnitData { return data.lessonId === 'unit-stars-milky-way'; }

export async function loadMilkyWayUnit(lesson: Lesson, read: typeof fetch = fetch) {
  if (!lesson.reader || !/^\/content\/[a-zA-Z0-9/_-]+\.json$/.test(lesson.reader)) throw new Error('This unit needs a local content file.');
  const response = await read(lesson.reader);
  if (!response.ok) throw new Error('The lesson could not be loaded. Please try again.');
  return validateMilkyWayUnit(await response.json(), lesson);
}
