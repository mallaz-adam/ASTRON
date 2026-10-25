import { isBeltChoice, type BeltChoice } from '../logic/taleJourney';

export type ChartStar = { id: string; name: string; raDegrees: number; decDegrees: number };
export type TaleExperienceData = {
  taleId: string; welcomeLine: string; starLine: string; endingLine: string; endingQuestion: string; fact: string;
  activity: { prompt: string; hint: string; rightLine: string; showLine: string; explanation: string;
    groups: { id: BeltChoice; label: string; description: string; starIds: string[]; missedLine: string }[] };
  chart: { epoch: string; stars: ChartStar[]; connections: [string, string][] };
  sources: { title: string; url: string }[];
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
function fail(field: string): never { throw new Error(`orion.json: ${field} — missing or invalid value.`); }

export function validateTaleExperience(value: unknown): TaleExperienceData {
  if (!record(value)) fail('root');
  for (const field of ['taleId', 'welcomeLine', 'starLine', 'endingLine', 'endingQuestion', 'fact']) if (!text(value[field])) fail(field);
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
  if (!Array.isArray(value.sources) || !value.sources.every(source => record(source) && text(source.title) && text(source.url) && /^https:\/\//.test(source.url))) fail('sources');
  return value as TaleExperienceData;
}

export async function loadTaleExperience(path: string, read: typeof fetch = fetch) {
  if (!/^\/content\/[a-zA-Z0-9/_-]+\.json$/.test(path)) throw new Error('This story needs a local content file.');
  const response = await read(path);
  if (!response.ok) throw new Error('The story could not be loaded. Please try again.');
  return validateTaleExperience(await response.json());
}
