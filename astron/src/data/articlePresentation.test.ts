import { describe, expect, it } from 'vitest';
import { sampleContent, sampleFiles } from './contentFixtures';
import { validateContent } from './contentLoader';

describe('Article covers and categories', () => {
  it('loads the authored category and credited local cover without requiring them for older content', () => {
    const article = sampleContent().articles.find(row => row.id === 'betelgeuse-colour')!;
    expect(article.category).toBe('Stars'); expect(article.cover?.src).toBe('/art/articles/betelgeuse-alma.jpg');
    expect(article.cover?.credit).toContain('ALMA');
    expect(sampleContent().articles.find(row => row.id === 'looking-slowly')?.cover).toBeUndefined();
  });
  it.each([['src', 'https://remote.example/picture.jpg'], ['source', 'javascript:alert(1)'], ['alt', ''], ['src', '/art/../private.jpg']])('rejects unsafe or inaccessible cover %s', (field, value) => {
    const files = sampleFiles();
    const article = (files.articles as { cover?: Record<string, unknown> }[]).find(row => row.cover)!;
    article.cover![field] = value;
    expect(() => validateContent(files)).toThrow('cover');
  });
});
