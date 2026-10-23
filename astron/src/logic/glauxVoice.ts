import type { Content, GlauxPoolId } from '../data/types';

// App messages use the same author-owned JSON as the lesson dialogue.
// They change with meaningful progress, never with a timer or a cell hover.
export function glauxLine(content: Pick<Content, 'glauxLines'>, id: GlauxPoolId, values: Record<string, string | number> = {}): string {
  const line = content.glauxLines.find(pool => pool.id === id)?.lines[0];
  if (!line) throw new Error(`glaux-lines.json: ${id} — missing dialogue.`);
  return line.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!Object.hasOwn(values, key)) throw new Error(`glaux-lines.json: ${id} — missing ${key}.`);
    return String(values[key]);
  });
}
