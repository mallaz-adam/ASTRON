import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sampleContent, sampleFiles } from './contentFixtures';
import { validateContent } from './contentLoader';
import type { Exercise, Lesson } from './types';

describe('Authored lesson files', () => {
  it('links cell three to the six exact card kinds, moods and pictures', () => {
    const content = sampleContent();
    const cell = content.cells.find(row => row.positionNo === 3)!;
    const lesson = content.lessons.find(row => row.cellId === cell.id)!;
    expect(lesson.id).toBe('lesson-03');
    expect(lesson.title).toBe('Why stars differ');
    expect(lesson.cards.map(card => card.kind)).toEqual(['say', 'idea', 'exercise', 'idea', 'exercise', 'recap']);
    expect(lesson.cards[0]).toMatchObject({ mood: 'happy', glaux: 'Why do some stars glow blue, while others glow like embers?', art: 'lesson-03-hook' });
    expect(lesson.cards[1]).toMatchObject({ mood: 'happy', glaux: 'Colour is a clue, even across the dark.', text: 'Stars come in many colours. Blue stars have the hottest surfaces. Red stars are cooler, though still fiercely hot.', art: 'lesson-03-colours' });
    expect(lesson.cards[3]).toMatchObject({ mood: 'thinking', glaux: "More fuel does not always mean more time. Let's look closer.", text: 'Mass means how much stuff a star holds. In their long, steady stage, heavier stars are bigger and hotter. They use up their fuel, a light gas called hydrogen, faster. So they live shorter lives.', art: 'lesson-03-fuel' });
    expect(lesson.cards[5]).toMatchObject({ mood: 'proud', glaux: 'Keep these three small clues. We will meet them again.', items: ['Blue stars are hotter than red stars.', 'Heavier stars are usually bigger and hotter.', 'Heavier stars use fuel faster and live shorter lives.'], art: 'lesson-03-emblems' });
    expect(content.lessons.filter(row => row.id !== lesson.id).every(row => row.placeholder && row.cards.length === 1)).toBe(true);
  });
  it('validates every exercise reference, every feedback line and each answer among its items', () => {
    const content = sampleContent();
    for (const lesson of content.lessons) for (const card of lesson.cards) {
      if (card.kind === 'exercise') expect(content.exercises.find(row => row.id === card.exerciseId)?.cellId).toBe(lesson.cellId);
    }
    for (const exercise of content.exercises) {
      for (const field of ['glaux', 'hint', 'rightLine', 'missedLine', 'explanation'] as const) expect(exercise[field].trim().length).toBeGreaterThan(0);
      const items = (exercise.contentData.options ?? exercise.contentData.items) as { id: string }[];
      if (exercise.type === 'choice') expect(items.map(row => row.id)).toContain(exercise.contentData.correctOptionId);
      if (exercise.type === 'order') expect([...(exercise.contentData.correctOrder as string[])].sort()).toEqual(items.map(row => row.id).sort());
    }
  });
  it('keeps the two exercise definitions verbatim', () => {
    const exercises = sampleContent().exercises;
    expect(exercises.find(row => row.id === 'ex-03-order')).toMatchObject({ glaux: 'Take your time. Follow the colours.', prompt: 'Arrange these stars from coolest surface to hottest.', hint: 'Blue stars are the hottest. Start with the coolest.', rightLine: 'You found the pattern. Let those colours guide you.', missedLine: 'Begin with red, then move towards blue. You can try again.', explanation: 'For these star colours, surface heat increases from red through orange to blue.', xpValue: 10, contentData: { items: [{ id: 'blue', text: 'Blue star', colour: '#A9C4EE' }, { id: 'red', text: 'Red star', colour: '#D9735A' }, { id: 'orange', text: 'Orange star', colour: '#E9B173' }], correctOrder: ['red', 'orange', 'blue'] } });
    expect(exercises.find(row => row.id === 'ex-03-choice')).toMatchObject({ glaux: 'Think about how quickly each star uses its fuel.', prompt: 'Two stars are in their steady stage. Which one usually lives shorter?', hint: 'Look at fuel use, not just fuel supply.', rightLine: 'You followed the fuel. That is the key.', missedLine: 'More mass means faster fuel use during this stage. Try that clue.', explanation: 'Heavier stars use fuel faster. The heaviest shine for only millions of years; the Sun for about ten billion.', xpValue: 10, contentData: { options: [{ id: 'A', text: 'The heavier star.' }, { id: 'B', text: 'The lighter star.' }, { id: 'C', text: 'Both live the same time.' }], correctOptionId: 'A' } });
  });
  it('requires a supplied static, described SVG for every picture', () => {
    for (const lesson of sampleContent().lessons) for (const card of lesson.cards) {
      if (card.kind !== 'exercise' && card.art) {
        const svg = readFileSync(new URL(`../../public/art/${card.art}.svg`, import.meta.url), 'utf8');
        expect(svg).toContain('role="img"'); expect(svg).toContain('aria-label=');
        expect(svg).not.toMatch(/<script|\bonload=|\bhref=/i);
      }
    }
  });
  it('reports a missing or cross-cell exercise with the card location', () => {
    const files = sampleFiles(); const lesson = (files.lessons as Lesson[]).find(row => row.id === 'lesson-03')!;
    lesson.cards[2] = { kind: 'exercise', exerciseId: 'missing' };
    expect(() => validateContent(files)).toThrow('cards[2].exerciseId');
    lesson.cards[2] = { kind: 'exercise', exerciseId: 'orion-choice' };
    expect(() => validateContent(files)).toThrow('cards[2].exerciseId');
  });
  it.each(['glaux', 'hint', 'rightLine', 'missedLine', 'explanation'])('rejects a missing %s line', field => {
    const files = sampleFiles(); const exercise = (files.exercises as Exercise[]).find(row => row.id === 'ex-03-order')!;
    delete (exercise as unknown as Record<string, unknown>)[field];
    expect(() => validateContent(files)).toThrow(field);
  });
  it('rejects unsupported cards, moods, missing copy and unregistered pictures', () => {
    for (const change of [{ kind: 'other' }, { mood: ['happy'] }, { glaux: '' }, { art: 'missing' }]) {
      const files = sampleFiles(); const lesson = (files.lessons as Lesson[]).find(row => row.id === 'lesson-03')!;
      Object.assign(lesson.cards[0], change);
      expect(() => validateContent(files)).toThrow('cards[0]');
    }
  });
});
