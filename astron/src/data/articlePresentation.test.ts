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
  it('organises the complete original article into three sections without changing its prose', () => {
    const article = sampleContent().articles.find(row => row.id === 'betelgeuse-colour')!;
    expect(article.sections?.map(section => section.text).join('\n\n')).toBe(article.body);
    expect(article.sections?.map(section => section.title)).toEqual(['Find the red star', 'A changing star', 'Two clues to keep']);
    expect(sampleContent().articles.find(row => row.id === 'looking-slowly')?.sections).toBeUndefined();
  });
  it.each(['duplicate', 'unsafe-id', 'missing-text', 'lost-prose'])('rejects %s article sections', problem => {
    const files = sampleFiles();
    const article = (files.articles as { sections?: { id: string; title: string; text: string }[] }[]).find(row => row.sections)!;
    if (problem === 'duplicate') article.sections![1].id = article.sections![0].id;
    if (problem === 'unsafe-id') article.sections![0].id = '<script>';
    if (problem === 'missing-text') article.sections![0].text = '';
    if (problem === 'lost-prose') article.sections!.pop();
    expect(() => validateContent(files)).toThrow('sections');
  });
});
