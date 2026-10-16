import { readFileSync } from 'node:fs';
import { contentFiles, validateContent } from './contentLoader';
import { contentFileName } from './contentSchema';

// Tests read the same JSON that the browser reads. This file is not used by pages.
export function sampleFiles(): Record<string, unknown> {
  return Object.fromEntries(contentFiles.map(name => [name, JSON.parse(readFileSync(new URL(`../../public/content/sample/${contentFileName(name)}`, import.meta.url), 'utf8'))]));
}

export function sampleContent() { return validateContent(sampleFiles(), 'public/content/sample/'); }
