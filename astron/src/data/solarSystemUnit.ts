import { checkRows, object, text } from './contentSchema';
import type { Lesson } from './types';
import type { UnitTerm } from './visualUnit';

export const planetIds = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'] as const;
export type PlanetId = typeof planetIds[number];
export type SolarImageId = PlanetId | 'sun' | 'moon' | 'asteroid' | 'comet' | 'pluto';
export const solarScenes = ['family', 'light-maker', 'planet-order', 'rocky-worlds', 'giant-worlds', 'giant-details', 'other-moons', 'small-worlds', 'pluto', 'solar-recap'] as const;
export type SolarScene = typeof solarScenes[number];
export type SolarStep = { id: string; title: string; scene: SolarScene; paragraphs: string[]; terms: string[]; glaux?: string };
export type SolarImage = { id: SolarImageId; name: string; src: string; alt: string; caption: string; credit: string; source: string; clue: string; group: string; license?: string };
export type SolarGroup = { id: string; label: string };
export type SolarSystemUnitData = {
  lessonId: string; unitNumber: 2; chapter: string; title: string; introduction: string[];
  steps: SolarStep[]; objects: SolarImage[]; glossary: UnitTerm[];
  orderPractice: { prompt: string; reference: string; hint: string; right: string; positions: string[]; correctOrder: PlanetId[]; feedback: string[] };
  sorting: { prompt: string; hint: string; right: string; groups: SolarGroup[]; cards: { id: string; imageId: SolarImageId; title: string; group: string; feedback: string }[] };
  plutoDetail: string[]; sources: { title: string; url: string }[];
};

const strings = (v: unknown) => Array.isArray(v) && v.every(text);
const https = (v: unknown) => typeof v === 'string' && /^https:\/\//.test(v);
export function validateSolarSystemUnit(value: unknown, lesson: Pick<Lesson, 'id'>): SolarSystemUnitData {
  function fail(message: string): never { throw new Error(`Solar system unit: ${message}`); }
  if (!object(value)) fail('expected an object.');
  const unit = value as SolarSystemUnitData;
  if (unit.lessonId !== lesson.id || unit.unitNumber !== 2 || !text(unit.title) || !text(unit.chapter) || !strings(unit.introduction) || !unit.introduction.length) fail('invalid unit identity.');
  checkRows(unit.steps, { id: text, title: text, scene: v => solarScenes.includes(v as SolarScene), paragraphs: v => strings(v) && (v as string[]).length > 0, terms: strings, glaux: v => v === undefined || text(v) }, 'solar steps');
  if (unit.steps.length !== solarScenes.length || new Set(unit.steps.map(s => s.id)).size !== unit.steps.length || unit.steps.map(s => s.scene).join() !== solarScenes.join()) fail('expected ten unique scenes in teaching order.');
  checkRows(unit.glossary, { term: text, definition: text, example: text }, 'solar glossary');
  if (new Set(unit.glossary.map(t => t.term)).size !== unit.glossary.length) fail('duplicate glossary term.');
  for (const step of unit.steps) if (step.terms.length > 2 || step.terms.some(t => !unit.glossary.some(entry => entry.term === t))) fail('unknown or too many linked terms.');
  checkRows(unit.objects, {
    id: v => [...planetIds, 'sun', 'moon', 'asteroid', 'comet', 'pluto'].includes(String(v)),
    name: text, src: v => typeof v === 'string' && /^\/art\/(solar-system|earth-sun-moon)\/[a-z-]+\.webp$/.test(v),
    alt: text, caption: text, credit: text, source: https, clue: text, group: text, license: v => v === undefined || text(v),
  }, 'solar pictures');
  if (unit.objects.length !== 13 || new Set(unit.objects.map(i => i.id)).size !== 13) fail('expected thirteen distinct described pictures.');
  const identities = { mercury: 'rocky', venus: 'rocky', earth: 'rocky', mars: 'rocky', jupiter: 'gas', saturn: 'gas', uranus: 'ice', neptune: 'ice', sun: 'star', moon: 'moon', asteroid: 'small', comet: 'small', pluto: 'dwarf' };
  for (const image of unit.objects) if (image.group !== identities[image.id]) fail('incorrect object group.');
  if (!unit.orderPractice || ![unit.orderPractice.prompt, unit.orderPractice.reference, unit.orderPractice.hint, unit.orderPractice.right].every(text)) fail('invalid order practice.');
  if (unit.orderPractice.correctOrder?.join() !== planetIds.slice(0, 4).join() || !strings(unit.orderPractice.positions) || unit.orderPractice.positions.length !== 4 || !strings(unit.orderPractice.feedback) || unit.orderPractice.feedback.length !== 4) fail('invalid inner planet order or feedback.');
  if (!unit.sorting || ![unit.sorting.prompt, unit.sorting.hint, unit.sorting.right].every(text)) fail('invalid sorting practice.');
  checkRows(unit.sorting.groups, { id: text, label: text }, 'solar sorting groups');
  checkRows(unit.sorting.cards, { id: text, imageId: v => unit.objects.some(i => i.id === v), title: text, group: v => unit.sorting.groups.some(g => g.id === v), feedback: text }, 'solar sorting cards');
  if (unit.sorting.groups.length !== 5 || new Set(unit.sorting.groups.map(g => g.id)).size !== 5 || unit.sorting.cards.length !== 7 || new Set(unit.sorting.cards.map(c => c.id)).size !== 7) fail('invalid sorting groups or cards.');
  const expected = { sun: 'star', mars: 'planet', saturn: 'planet', moon: 'moon', asteroid: 'small', comet: 'small', pluto: 'dwarf' };
  for (const [id, group] of Object.entries(expected)) if (!unit.sorting.cards.some(c => c.imageId === id && c.group === group)) fail('incorrect object classification.');
  if (!strings(unit.plutoDetail) || !unit.plutoDetail.length) fail('missing optional Pluto explanation.');
  checkRows(unit.sources, { title: text, url: https }, 'solar sources');
  const copy = [...unit.introduction, ...unit.steps.flatMap(s => s.paragraphs), ...unit.glossary.flatMap(t => [t.definition, t.example])].join(' ');
  if (/<\/?[a-z][^>]*>/i.test(copy)) fail('remove formatting tags from teaching copy.');
  return unit;
}

export function isSolarSystemUnit(data: { lessonId: string }): data is SolarSystemUnitData {
  return data.lessonId === 'unit-our-solar-system';
}

export async function loadSolarSystemUnit(lesson: Lesson, read: typeof fetch = fetch) {
  if (!lesson.reader || !/^\/content\/[a-zA-Z0-9/_-]+\.json$/.test(lesson.reader)) throw new Error('This unit needs a local content file.');
  const response = await read(lesson.reader);
  if (!response.ok) throw new Error('The lesson could not be loaded. Please try again.');
  return validateSolarSystemUnit(await response.json(), lesson);
}
