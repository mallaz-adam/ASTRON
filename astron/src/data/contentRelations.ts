import type { Content } from './types';
import { contentError, contentFileName } from './contentSchema';

export function validateRelations(content: Content, folder: string) {
  function relation(table: keyof Content, field: string, target: keyof Content, targetField = 'id') {
    const known = new Set(content[target].map(row => (row as unknown as Record<string, unknown>)[targetField]));
    content[table].forEach((row, index) => {
      const value = (row as unknown as Record<string, unknown>)[field];
      if (value !== undefined && !known.has(value)) contentError(`${folder}${table}.json`, `[${index}].${field}`, `no matching row in ${target}.json.`);
    });
  }
  relation('stars', 'constellationId', 'constellations');
  relation('tales', 'starId', 'stars');
  relation('chapters', 'taleId', 'tales');
  relation('cells', 'unitId', 'units');
  relation('cells', 'taleId', 'tales');
  relation('lessons', 'cellId', 'cells');
  relation('exercises', 'cellId', 'cells');
  relation('unitArticles', 'unitId', 'units');
  relation('unitArticles', 'articleId', 'articles');
  const rewards = { learn: 20, story: 15, read: 10 };
  for (const kind of ['learn', 'story', 'read'] as const) {
    const matches = content.quests.filter(quest => quest.kind === kind);
    if (matches.length !== 1) contentError(`${folder}quests.json`, 'kind', `expected exactly one ${kind} quest.`);
    if (matches[0].xpReward !== rewards[kind]) contentError(`${folder}quests.json`, `${kind}.xpReward`, `must be ${rewards[kind]}.`);
  }
  for (const table of Object.keys(content) as (keyof Content)[]) {
    const seen = new Set<string>();
    content[table].forEach((row, index) => {
      const record = row as unknown as Record<string, unknown>;
      const keyFields = table === 'chapters' ? ['taleId', 'number'] : table === 'unitArticles' ? ['unitId', 'articleId'] : ['id'];
      const key = JSON.stringify(keyFields.map(field => record[field]));
      if (seen.has(key)) contentError(`${folder}${contentFileName(table)}`, `[${index}].${keyFields.join('+')}`, 'duplicate key.');
      seen.add(key);
    });
  }
  const positions = new Set<string>();
  content.cells.forEach((cell, index) => {
    const key = JSON.stringify([cell.unitId, cell.positionNo]);
    if (positions.has(key)) contentError(`${folder}cells.json`, `[${index}].positionNo`, 'already used in this unit.');
    positions.add(key);
  });
  content.lessons.forEach((lesson, index) => {
    if (content.cells.find(cell => cell.id === lesson.cellId)?.kind !== 'lesson') {
      contentError(`${folder}lessons.json`, `[${index}].cellId`, 'must point to a lesson cell.');
    }
  });
}
