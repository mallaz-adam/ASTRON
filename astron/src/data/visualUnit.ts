import { checkRows, text } from './contentSchema';
import type { Lesson } from './types';

export const unitScenes = ['gallery', 'sun', 'earth', 'orbit', 'moon', 'paths', 'sunlight', 'reflection', 'comparison', 'recap'] as const;
export type UnitScene = typeof unitScenes[number];
export type ObjectId = 'earth' | 'sun' | 'moon';
export type ObjectKind = 'planet' | 'star' | 'natural satellite';
export type UnitObject = { id: ObjectId; name: string; kind: ObjectKind; clue: string; src: string; alt: string; caption: string; credit: string; source: string };
export type UnitStep = { id: string; title: string; scene: UnitScene; paragraphs: string[]; terms: string[]; glaux?: string };
export type UnitTerm = { term: string; definition: string; example: string };
export type VisualUnitData = {
  lessonId: string; chapter: string; title: string; introduction: string[];
  steps: UnitStep[]; objects: UnitObject[]; glossary: UnitTerm[];
  matching: { prompt: string; hint: string; right: string; feedback: Record<ObjectId, Partial<Record<ObjectKind, string>>> };
  choice: { prompt: string; hint: string; options: { id: string; text: string; feedback: string }[]; correct: string; explanation: string };
  sources: { title: string; url: string }[];
};

const https = (v: unknown) => typeof v === 'string' && /^https:\/\//.test(v);
const strings = (v: unknown) => Array.isArray(v) && v.every(text);

export function validateVisualUnit(value: unknown, lesson: Pick<Lesson, 'id'>): VisualUnitData {
  function fail(message: string): never { throw new Error(`Visual unit: ${message}`); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('expected an object.');
  const unit = value as VisualUnitData;
  if (unit.lessonId !== lesson.id || !text(unit.title) || !text(unit.chapter) || !strings(unit.introduction) || !unit.introduction.length) fail('invalid lesson identity or introduction.');
  checkRows(unit.steps, {
    id: text, title: text, scene: v => unitScenes.includes(v as UnitScene),
    paragraphs: v => strings(v) && (v as string[]).length > 0, terms: strings, glaux: v => v === undefined || text(v),
  }, 'unit steps');
  if (unit.steps.length !== 10 || new Set(unit.steps.map(s => s.id)).size !== 10) fail('expected ten unique teaching steps.');
  if (unit.steps.map(s => s.scene).join() !== unitScenes.join()) fail('teaching scenes are out of order.');
  checkRows(unit.glossary, { term: text, definition: text, example: text }, 'unit glossary');
  if (new Set(unit.glossary.map(t => t.term)).size !== unit.glossary.length) fail('duplicate glossary term.');
  for (const step of unit.steps) {
    if (step.glaux !== undefined && !text(step.glaux)) fail('invalid Glaux line.');
    if (step.terms.length > 2 || step.terms.some(term => !unit.glossary.some(t => t.term === term))) fail('unknown or too many linked terms.');
  }
  checkRows(unit.objects, {
    id: v => ['earth', 'sun', 'moon'].includes(String(v)), name: text,
    kind: v => ['planet', 'star', 'natural satellite'].includes(String(v)), clue: text,
    src: v => typeof v === 'string' && /^\/art\/earth-sun-moon\/[a-z-]+\.webp$/.test(v),
    alt: text, caption: text, credit: text, source: https,
  }, 'unit pictures');
  if (unit.objects.length !== 3 || new Set(unit.objects.map(o => o.id)).size !== 3) fail('expected Earth, Sun and Moon pictures.');
  const identities = { earth: 'planet', sun: 'star', moon: 'natural satellite' };
  for (const object of unit.objects) if (object.kind !== identities[object.id]) fail('incorrect object identity.');
  if (!unit.matching || ![unit.matching.prompt, unit.matching.hint, unit.matching.right].every(text)) fail('invalid matching practice.');
  for (const object of unit.objects) for (const kind of Object.values(identities)) {
    if (kind !== object.kind && !text(unit.matching.feedback?.[object.id]?.[kind as ObjectKind])) fail('missing targeted matching feedback.');
  }
  if (!unit.choice || ![unit.choice.prompt, unit.choice.hint, unit.choice.explanation].every(text)) fail('invalid moonlight practice.');
  checkRows(unit.choice.options, { id: text, text, feedback: text }, 'unit choices');
  if (unit.choice.options.length !== 3 || new Set(unit.choice.options.map(o => o.id)).size !== 3 || !unit.choice.options.some(o => o.id === unit.choice.correct)) fail('invalid choice answer.');
  checkRows(unit.sources, { title: text, url: https }, 'unit sources');
  return unit;
}

export async function loadVisualUnit(lesson: Lesson, read: typeof fetch = fetch) {
  if (!lesson.reader || !/^\/content\/[a-zA-Z0-9/_-]+\.json$/.test(lesson.reader)) throw new Error('This unit needs a local content file.');
  const response = await read(lesson.reader);
  if (!response.ok) throw new Error('The lesson could not be loaded. Please try again.');
  return validateVisualUnit(await response.json(), lesson);
}
