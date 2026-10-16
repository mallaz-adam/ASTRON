import type { Content } from './types';
import { checkRows, contentError, text, type Schema } from './contentSchema';

export const lessonArtIds = ['lesson-03-hook', 'lesson-03-colours', 'lesson-03-fuel', 'lesson-03-emblems'];

export function validateLessons(content: Content, folder: string) {
  const seenCells = new Set<string>();
  content.lessons.forEach((lesson, index) => {
    const file = `${folder}lessons.json`;
    if (seenCells.has(lesson.cellId)) contentError(file, `[${index}].cellId`, 'only one lesson may belong to a cell.');
    seenCells.add(lesson.cellId);
    const usedExercises = new Set<string>();
    lesson.cards.forEach((card, position) => {
      const field = `[${index}].cards[${position}]`;
      if (!card || typeof card !== 'object') contentError(file, field, 'expected a card object.');
      if (!['say', 'idea', 'exercise', 'recap', 'hunch', 'dial', 'mass', 'race', 'gap'].includes(card.kind)) contentError(file, `${field}.kind`, 'unknown card kind.');
      const fields: Schema = { kind: text };
      if (card.kind === 'exercise') fields.exerciseId = text;
      else {
        fields.mood = value => typeof value === 'string' && ['happy', 'thinking', 'proud', 'cheering', 'gentle', 'sleepy'].includes(value);
        fields.glaux = card.kind === 'hunch' ? value => Array.isArray(value) && value.length === 2 && value.every(text) : text;
        if (card.art !== undefined) fields.art = value => typeof value === 'string' && lessonArtIds.includes(value);
        if (['idea', 'dial', 'mass', 'race', 'gap'].includes(card.kind)) fields.text = text;
        if (card.kind === 'hunch') {
          fields.options = value => Array.isArray(value) && value.length === 3;
          fields.skipLabel = text;
        }
        if (card.kind === 'recap') fields.items = value => Array.isArray(value) && value.length === 3 && value.every(text);
      }
      try { checkRows([card], fields, file); }
      catch (problem) { throw new Error(String((problem as Error).message).replace('[0].', `${field}.`)); }
      if (card.kind === 'hunch') {
        try {
          checkRows(card.options, { id: value => ['blue', 'orange', 'red'].includes(String(value)), text, colour: value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) }, file);
        } catch (problem) { throw new Error(`${file}: ${field}.options — ${(problem as Error).message}`); }
        if (new Set(card.options.map(option => option.id)).size !== 3) contentError(file, `${field}.options`, 'expected blue, orange and red once each.');
      }
      if (card.kind === 'exercise') {
        const exercise = content.exercises.find(row => row.id === card.exerciseId);
        if (!exercise || exercise.cellId !== lesson.cellId) contentError(file, `${field}.exerciseId`, 'must name an exercise in this lesson cell.');
        if (!['order', 'choice'].includes(exercise.type)) contentError(file, `${field}.exerciseId`, 'the player supports order and choice for now.');
        if (usedExercises.has(exercise.id)) contentError(file, `${field}.exerciseId`, 'an exercise may appear only once in a lesson.');
        usedExercises.add(exercise.id);
      }
    });
  });
  content.cells.filter(cell => cell.kind === 'lesson').forEach(cell => {
    if (!seenCells.has(cell.id)) contentError(`${folder}lessons.json`, 'cellId', `missing lesson for ${cell.id}.`);
  });
}
