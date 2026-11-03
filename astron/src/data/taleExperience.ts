import { isBeltChoice, type BeltChoice } from '../logic/taleJourney';

export type ChartStar = { id: string; name: string; raDegrees: number; decDegrees: number };
type TaleReaderBase = {
  taleId: string; welcomeLine: string; starLine: string; endingLine: string; endingQuestion: string; fact: string;
  sources: { title: string; url: string }[];
};
export type OrionTaleData = TaleReaderBase & {
  kind?: 'orion';
  activity: { prompt: string; hint: string; rightLine: string; showLine: string; explanation: string;
    groups: { id: BeltChoice; label: string; description: string; starIds: string[]; missedLine: string }[] };
  chart: { epoch: string; stars: ChartStar[]; connections: [string, string][] };
};

export type StoryArtwork = {
  src: string; alt: string; caption: string; width: number; height: number;
  credit: string; source?: string; license: string; licenseUrl?: string;
};
export type IllustratedTaleData = TaleReaderBase & {
  kind: 'illustrated'; starName: string; sourceNotes: string[];
  cover: StoryArtwork;
  scenes: { number: number; artwork: StoryArtwork }[];
  epilogue: {
    title: string; text: string; photograph: StoryArtwork; pattern: StoryArtwork;
    observingNote: string;
    discoveries: { id: string; label: string; text: string }[];
  };
};
export type TaleExperienceData = OrionTaleData | IllustratedTaleData;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
function fail(field: string): never { throw new Error(`Story reader: ${field} — missing or invalid value.`); }
const https = (value: unknown) => typeof value === 'string' && /^https:\/\//.test(value);
const paragraphs = (value: unknown): value is string[] => Array.isArray(value) && value.length > 0 && value.every(text);

function checkArtwork(value: unknown, field: string) {
  if (!record(value)) fail(field);
  if (typeof value.src !== 'string' || !/^\/art\/[a-zA-Z0-9/_-]+\.(svg|webp)$/.test(value.src)) fail(`${field}.src`);
  for (const key of ['alt', 'caption', 'credit', 'license']) if (!text(value[key])) fail(`${field}.${key}`);
  for (const key of ['width', 'height']) if (typeof value[key] !== 'number' || !Number.isInteger(value[key]) || value[key] <= 0) fail(`${field}.${key}`);
  for (const key of ['source', 'licenseUrl']) if (value[key] !== undefined && !https(value[key])) fail(`${field}.${key}`);
}

export function validateTaleExperience(value: unknown): TaleExperienceData {
  if (!record(value)) fail('root');
  for (const field of ['taleId', 'welcomeLine', 'starLine', 'endingLine', 'endingQuestion', 'fact']) if (!text(value[field])) fail(field);
  if (!Array.isArray(value.sources) || !value.sources.length || !value.sources.every(source => record(source) && text(source.title) && https(source.url))) fail('sources');
  if (value.kind === 'illustrated') {
    if (!text(value.starName) || !paragraphs(value.sourceNotes)) fail('starName/sourceNotes');
    checkArtwork(value.cover, 'cover');
    if (!Array.isArray(value.scenes) || !value.scenes.length) fail('scenes');
    value.scenes.forEach((scene, index) => {
      if (!record(scene) || scene.number !== index + 1) fail(`scenes[${index}].number`);
      checkArtwork(scene.artwork, `scenes[${index}].artwork`);
    });
    if (!record(value.epilogue)) fail('epilogue');
    for (const key of ['title', 'text', 'observingNote']) if (!text(value.epilogue[key])) fail(`epilogue.${key}`);
    checkArtwork(value.epilogue.photograph, 'epilogue.photograph');
    checkArtwork(value.epilogue.pattern, 'epilogue.pattern');
    if (!Array.isArray(value.epilogue.discoveries)) fail('epilogue.discoveries');
    const detailIds = new Set<string>();
    for (const detail of value.epilogue.discoveries) {
      if (!record(detail) || !text(detail.id) || !text(detail.label) || !text(detail.text) || detailIds.has(detail.id)) fail('epilogue.discoveries');
      detailIds.add(detail.id);
    }
    if ('activity' in value || 'chart' in value) fail('illustrated stories do not use the Orion activity');
    return value as IllustratedTaleData;
  }
  if (value.kind !== undefined && value.kind !== 'orion') fail('kind');
  if (!record(value.chart) || !text(value.chart.epoch) || !Array.isArray(value.chart.stars) || !value.chart.stars.length) fail('chart');
  const ids = new Set<string>();
  for (const star of value.chart.stars) {
    if (!record(star) || !text(star.id) || !text(star.name) || ids.has(star.id)) fail('chart.stars');
    if (typeof star.raDegrees !== 'number' || !Number.isFinite(star.raDegrees) || star.raDegrees < 0 || star.raDegrees >= 360) fail('chart.stars.raDegrees');
    if (typeof star.decDegrees !== 'number' || !Number.isFinite(star.decDegrees) || Math.abs(star.decDegrees) > 90) fail('chart.stars.decDegrees');
    ids.add(star.id);
  }
  if (!Array.isArray(value.chart.connections) || !value.chart.connections.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(id => typeof id === 'string' && ids.has(id)))) fail('chart.connections');
  if (!record(value.activity)) fail('activity');
  for (const field of ['prompt', 'hint', 'rightLine', 'showLine', 'explanation']) if (!text(value.activity[field])) fail(`activity.${field}`);
  if (!Array.isArray(value.activity.groups) || value.activity.groups.length !== 3) fail('activity.groups');
  const groups = new Set<string>();
  for (const group of value.activity.groups) {
    if (!record(group) || !isBeltChoice(group.id) || groups.has(group.id) || !text(group.label) || !text(group.description) || typeof group.missedLine !== 'string') fail('activity.groups');
    if (!Array.isArray(group.starIds) || group.starIds.length !== 3 || new Set(group.starIds).size !== 3 || !group.starIds.every(id => typeof id === 'string' && ids.has(id))) fail('activity.groups.starIds');
    if (group.id === 'belt' && [...group.starIds].sort().join(',') !== 'alnilam,alnitak,mintaka') fail('activity.groups.belt');
    if (group.id !== 'belt' && !text(group.missedLine)) fail('activity.groups.missedLine');
    groups.add(group.id);
  }
  return value as OrionTaleData;
}

export async function loadTaleExperience(path: string, read: typeof fetch = fetch) {
  if (!/^\/content\/[a-zA-Z0-9/_-]+\.json$/.test(path)) throw new Error('This story needs a local content file.');
  const response = await read(path);
  if (!response.ok) throw new Error('The story could not be loaded. Please try again.');
  try { return validateTaleExperience(await response.json()); }
  catch (problem) {
    throw new Error(`${path}: ${problem instanceof SyntaxError ? 'invalid JSON; check commas and quotes.' : problem instanceof Error ? problem.message : 'invalid story content.'}`);
  }
}
