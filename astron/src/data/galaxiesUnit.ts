import { checkRows, object, text } from './contentSchema';
import type { Lesson } from './types';
import type { UnitTerm } from './visualUnit';

export const galaxyScenes = ['home', 'contents', 'gravity', 'beyond', 'andromeda', 'shapes', 'observation', 'reconstruction', 'universe', 'observable'] as const;
export type GalaxyScene = typeof galaxyScenes[number];
export const galaxyImageIds = ['m51', 'ic-2006', 'deep-field', 'andromeda', 'milky-model'] as const;
export type GalaxyImageId = typeof galaxyImageIds[number];
export type GalaxyImage = {
  id: GalaxyImageId; name: string; src: string; width: number; height: number;
  alt: string; caption: string; credit: string; source: string;
  mediaType: string; license: string; licenseUrl: string; changes: string;
};
export type GalaxyQuestion = {
  id: string; prompt: string; correct: string;
  options: { id: string; text: string; feedback: string }[];
};
export type GalaxiesUnitData = {
  lessonId: 'unit-galaxies-universe'; unitNumber: 4; chapter: string; title: string;
  introduction: string[];
  steps: { id: string; title: string; scene: GalaxyScene; paragraphs: string[]; terms: string[]; invitation: string; glaux?: string }[];
  recap: { title: string; paragraphs: string[]; glaux: string };
  objects: GalaxyImage[]; glossary: UnitTerm[];
  choice: GalaxyQuestion & { hint: string; explanation: string };
  evidence: { prompt: string; hint: string; questions: GalaxyQuestion[] };
  sources: { title: string; url: string }[];
};

const strings = (v: unknown) => Array.isArray(v) && v.length > 0 && v.every(text);
const https = (v: unknown) => typeof v === 'string' && /^https:\/\//.test(v);
const distinct = (rows: { id: string }[]) => new Set(rows.map(row => row.id)).size === rows.length;

export function validateGalaxiesUnit(value: unknown, lesson: Pick<Lesson, 'id'>): GalaxiesUnitData {
  function fail(message: string): never { throw new Error(`Galaxies unit: ${message}`); }
  if (!object(value)) fail('expected an object.');
  const unit = value as GalaxiesUnitData;
  if (unit.lessonId !== 'unit-galaxies-universe' || unit.lessonId !== lesson.id || unit.unitNumber !== 4 || !text(unit.chapter) || !text(unit.title) || !strings(unit.introduction)) fail('invalid identity or introduction.');
  checkRows(unit.steps, { id: text, title: text, scene: v => galaxyScenes.includes(v as GalaxyScene), paragraphs: strings, terms: v => Array.isArray(v) && v.every(text), invitation: text, glaux: v => v === undefined || text(v) }, 'Galaxies steps');
  if (unit.steps.length !== 10 || !distinct(unit.steps) || unit.steps.map(s => s.scene).join() !== galaxyScenes.join()) fail('expected ten distinct teaching scenes in order.');
  if (!unit.recap || !text(unit.recap.title) || !text(unit.recap.glaux) || !strings(unit.recap.paragraphs) || unit.recap.paragraphs.length !== 3) fail('expected a separate three-point recap.');
  checkRows(unit.glossary, { term: text, definition: text, example: text }, 'Galaxies glossary');
  if (new Set(unit.glossary.map(t => t.term)).size !== unit.glossary.length) fail('duplicate glossary term.');
  for (const step of unit.steps) {
    if (step.terms.length > 2 || new Set(step.terms).size !== step.terms.length || step.terms.some(term => !unit.glossary.some(entry => entry.term === term) || !step.paragraphs.join(' ').toLowerCase().includes(term))) fail('linked terms must occur in the step and have definitions, at most two.');
  }
  checkRows(unit.objects, {
    id: v => galaxyImageIds.includes(v as GalaxyImageId), name: text,
    src: v => typeof v === 'string' && (/^\/art\/galaxies\/[a-z0-9-]+\.webp$/.test(v) || v === '/art/milky-way/galaxy-above.webp'),
    width: v => Number.isInteger(v) && Number(v) > 0, height: v => Number.isInteger(v) && Number(v) > 0,
    alt: text, caption: text, credit: text, source: https, mediaType: text, license: text, licenseUrl: https, changes: text,
  }, 'Galaxies pictures');
  if (unit.objects.length !== 5 || !distinct(unit.objects)) fail('expected five distinct local pictures with provenance.');
  for (const image of unit.objects) {
    if (image.id === 'milky-model' ? !/reconstruction/i.test(image.mediaType) : !/observation/i.test(image.mediaType)) fail('retain the distinction between observation and reconstruction.');
  }
  function question(q: GalaxyQuestion | undefined) {
    if (!q || !text(q.id) || !text(q.prompt)) fail('missing practice prompt.');
    checkRows(q.options, { id: text, text, feedback: text }, 'Galaxies answers');
    if (q.options.length < 2 || !distinct(q.options) || !q.options.some(o => o.id === q.correct)) fail('invalid practice answer.');
  }
  question(unit.choice);
  if (!text(unit.choice.hint) || !text(unit.choice.explanation)) fail('missing practice explanation.');
  if (!unit.evidence || !text(unit.evidence.prompt) || !text(unit.evidence.hint) || !Array.isArray(unit.evidence.questions) || unit.evidence.questions.length !== 3 || !distinct(unit.evidence.questions)) fail('expected three evidence questions.');
  unit.evidence.questions.forEach(question);
  checkRows(unit.sources, { title: text, url: https }, 'Galaxies sources');
  if (/\\u0000|\uFFFD|<\/?[a-z][^>]*>/i.test(JSON.stringify(unit))) fail('remove PDF export characters or formatting tags.');
  return unit;
}

export function isGalaxiesUnit(data: { lessonId: string }): data is GalaxiesUnitData { return data.lessonId === 'unit-galaxies-universe'; }

export async function loadGalaxiesUnit(lesson: Lesson, read: typeof fetch = fetch) {
  if (!lesson.reader || !/^\/content\/[a-zA-Z0-9/_-]+\.json$/.test(lesson.reader)) throw new Error('This unit needs a local content file.');
  const response = await read(lesson.reader);
  if (!response.ok) throw new Error('The lesson could not be loaded. Please try again.');
  return validateGalaxiesUnit(await response.json(), lesson);
}
