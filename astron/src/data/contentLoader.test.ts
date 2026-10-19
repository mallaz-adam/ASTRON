import { describe, expect, it, vi } from 'vitest';
import { loadContent, validateContent } from './contentLoader';
import { sampleContent, sampleFiles } from './contentFixtures';

describe('Content files', () => {
  it('loads the Clues constellation with no myth or invented Greek letter', () => {
    const content = sampleContent();
    expect(content.constellations.find(row => row.id === 'clues')).toEqual({ id: 'clues', name: 'Clues', mythNote: '' });
    expect(content.stars.find(row => row.id === 'star-clue-03')).toEqual({ id: 'star-clue-03', name: 'The first clue', greekLetter: '', factText: 'Blue stars are hotter than red stars.', constellationId: 'clues' });
    for (const field of ['mythNote', 'greekLetter']) {
      const files = sampleFiles();
      const rows = (field === 'mythNote' ? files.constellations : files.stars) as Record<string, unknown>[];
      delete rows[0][field];
      expect(() => validateContent(files)).toThrow(field);
    }
  });
  it('loads the complete authoring sample', () => {
    const content = sampleContent();
    expect(content.cells.map(cell => cell.kind)).toEqual(['lesson', 'lesson', 'lesson', 'tale', 'lesson', 'lesson', 'tale', 'lesson', 'lesson', 'lesson', 'quiz']);
    expect(content.chapters).toHaveLength(3);
    expect(content.exercises).toHaveLength(4);
    expect(Object.isFrozen(content.tales[0])).toBe(true);
  });
  it('names the file and field for a bad number', () => {
    const files = sampleFiles();
    (files.tales as Record<string, unknown>[])[0].minutes = 'three';
    expect(() => validateContent(files)).toThrow('tales.json: [0].minutes');
  });
  it('names a missing required field', () => {
    const files = sampleFiles(); delete (files.stars as Record<string, unknown>[])[0].name;
    expect(() => validateContent(files)).toThrow('stars.json: [0].name');
  });
  it('catches a misspelled field', () => {
    const files = sampleFiles(); (files.stars as Record<string, unknown>[])[0].greekletter = 'α';
    expect(() => validateContent(files)).toThrow('stars.json: [0].greekletter');
  });
  it('requires an array at the top of each file', () => {
    const files = sampleFiles(); files.interests = {};
    expect(() => validateContent(files)).toThrow('interests.json: root');
  });
  it('rejects missing linked content', () => {
    const files = sampleFiles(); (files.tales as Record<string, unknown>[])[0].starId = 'missing';
    expect(() => validateContent(files)).toThrow('tales.json: [0].starId');
  });
  it('rejects duplicate chapter keys', () => {
    const files = sampleFiles(); const chapters = files.chapters as unknown[]; chapters.push(chapters[0]);
    expect(() => validateContent(files)).toThrow('chapters.json: [3].taleId+number');
  });
  it('requires taleId on a tale cell only', () => {
    const files = sampleFiles(); const cells = files.cells as Record<string, unknown>[]; delete cells[3].taleId;
    expect(() => validateContent(files)).toThrow('cells.json: [3].taleId');
    cells[3].taleId = 'orion-shoulder'; cells[0].taleId = 'orion-shoulder';
    expect(() => validateContent(files)).toThrow('cells.json: [0].taleId');
  });
  it('requires the fixed daily quest rewards', () => {
    const files = sampleFiles(); (files.quests as Record<string, unknown>[])[0].xpReward = 21;
    expect(() => validateContent(files)).toThrow('quests.json: learn.xpReward');
  });
  it('rejects duplicate quest kinds', () => {
    const files = sampleFiles(); const quests = files.quests as unknown[]; quests.push(quests[0]);
    expect(() => validateContent(files)).toThrow('quests.json: kind');
  });
  it('names the nested exercise field', () => {
    const files = sampleFiles(); const exercises = files.exercises as { contentData: Record<string, unknown> }[];
    exercises[0].contentData.correctOptionId = 'missing';
    expect(() => validateContent(files)).toThrow('exercises.json: [0].contentData.correctOptionId');
  });
  it('loads all files through the supplied reader', async () => {
    const files = sampleFiles();
    const read = vi.fn(async (path: string | URL | Request) => new Response(JSON.stringify(files[String(path).split('/').at(-1)!.replace('.json', '').replace('glaux-lines', 'glauxLines')])));
    expect((await loadContent('/content/sample/', read)).units).toHaveLength(1);
    expect(read).toHaveBeenCalledTimes(13);
  });
  it('reports invalid JSON clearly', async () => {
    const read = vi.fn(async () => new Response('{broken'));
    await expect(loadContent('/content/sample/', read)).rejects.toThrow('interests.json: root — invalid JSON');
  });
  it('reports a missing file clearly', async () => {
    const read = vi.fn(async () => new Response('', { status: 404 }));
    await expect(loadContent('/content/sample/', read)).rejects.toThrow('interests.json: root');
  });
});
