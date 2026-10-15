// Small checks give the author a file name and an exact field to fix.
type Check = (value: unknown) => boolean;
export type Schema = Record<string, Check>;
export const object: Check = value => typeof value === 'object' && value !== null && !Array.isArray(value);
export const text: Check = value => typeof value === 'string' && value.trim().length > 0;
const whole: Check = value => typeof value === 'number' && Number.isInteger(value) && value >= 0;
const positive: Check = value => whole(value) && (value as number) > 0;
const oneOf = (...choices: string[]): Check => value => typeof value === 'string' && choices.includes(value);
const texts: Check = value => Array.isArray(value) && value.every(text);

export const contentSchema = {
  interests: { id: text, label: text },
  constellations: { id: text, name: text, mythNote: text },
  stars: { id: text, name: text, greekLetter: text, factText: text, constellationId: text },
  tales: { id: text, title: text, subtitle: text, minutes: positive, teaser: text, sourceNote: text, starId: text },
  chapters: { taleId: text, number: positive, title: text, text, marginNotes: texts },
  units: { id: text, title: text, summary: text, orderNo: positive },
  cells: { id: text, positionNo: positive, title: text, kind: oneOf('lesson', 'tale', 'quiz'), minutes: positive, unitId: text },
  lessons: { id: text, title: text, cards: value => Array.isArray(value) && value.length > 0, cellId: text },
  exercises: { id: text, type: oneOf('choice', 'connect', 'order', 'find', 'estimate'), prompt: text, contentData: object, xpValue: whole, cellId: text, glaux: text, hint: text, rightLine: text, missedLine: text, explanation: text },
  quests: { id: text, kind: oneOf('learn', 'story', 'read'), title: text, xpReward: whole },
  articles: { id: text, title: text, summary: text, body: text, readingMin: positive },
  unitArticles: { unitId: text, articleId: text },
} satisfies Record<string, Schema>;

export function contentError(file: string, field: string, message: string): never {
  throw new Error(`${file}: ${field} — ${message}`);
}

export function checkRows(value: unknown, schema: Schema, file: string): Record<string, unknown>[] {
  if (!Array.isArray(value)) contentError(file, 'root', 'expected a JSON array of rows.');
  return value.map((row, index) => {
    if (!object(row)) contentError(file, `[${index}]`, 'expected an object.');
    const record = row as Record<string, unknown>;
    const fields = { ...schema };
    if (file.endsWith('cells.json') && record.kind === 'tale') fields.taleId = text;
    if (file.endsWith('lessons.json') && record.placeholder !== undefined) fields.placeholder = value => typeof value === 'boolean';
    for (const [field, check] of Object.entries(fields)) {
      if (!check(record[field])) contentError(file, `[${index}].${field}`, 'missing or invalid value.');
    }
    for (const field of Object.keys(record)) {
      if (!Object.hasOwn(fields, field)) contentError(file, `[${index}].${field}`, 'unexpected field; check its spelling.');
    }
    return record;
  });
}
