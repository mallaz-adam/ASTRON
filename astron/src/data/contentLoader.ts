import type { Content } from './types';
import { checkRows, contentError, contentFileName, contentSchema } from './contentSchema';
import { glauxPoolIds } from './types';
import { validateRelations } from './contentRelations';
import { validateExercise } from './exerciseValidation';
import { validateLessons } from './lessonValidation';

export const contentFiles = Object.keys(contentSchema) as (keyof Content)[];

export function validateContent(files: Record<string, unknown>, folder = ''): Content {
  const rows = Object.fromEntries(contentFiles.map(name => [
    name, checkRows(files[name], contentSchema[name], `${folder}${contentFileName(name)}`),
  ]));
  // Every table has been checked above; now check links between tables.
  const content = rows as unknown as Content;
  validateRelations(content, folder);
  content.exercises.forEach((exercise, index) => validateExercise(exercise, `${folder}exercises.json`, index));
  validateLessons(content, folder);
  for (const id of glauxPoolIds) {
    if (!content.glauxLines.some(pool => pool.id === id)) contentError(`${folder}glaux-lines.json`, id, 'missing reaction pool.');
  }
  return freezeContent(content);
}

function freezeContent<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeContent);
    Object.freeze(value);
  }
  return value;
}

export async function loadContent(
  folder = `${import.meta.env.BASE_URL}content/sample/`,
  read: typeof fetch = fetch,
): Promise<Content> {
  const base = folder.endsWith('/') ? folder : `${folder}/`;
  const pairs = await Promise.all(contentFiles.map(async name => {
    const file = `${base}${contentFileName(name)}`;
    let response: Response;
    try { response = await read(file); }
    catch { return contentError(file, 'root', 'could not read the file.'); }
    if (!response.ok) contentError(file, 'root', `could not read the file (HTTP ${response.status}).`);
    let value: unknown;
    try { value = await response.json(); }
    catch { return contentError(file, 'root', 'invalid JSON; check commas, quotes, and brackets.'); }
    return [name, value] as const;
  }));
  return validateContent(Object.fromEntries(pairs), base);
}
