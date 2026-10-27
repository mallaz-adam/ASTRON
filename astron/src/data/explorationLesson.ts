import { checkRows, text } from './contentSchema';
import type { Content, Lesson } from './types';

export type ExplorationSection = { id: string; title: string; glaux: string; paragraphs: string[]; diagram: 'address' | 'sun' | 'scale' | 'models' | 'neighbour' | 'galaxy' | 'universe' | 'recap' };
export type ExamTopic = { id: string; title: string; reviewSection: string; secureLine: string; reviewLine: string };
export type ExplorationLesson = { lessonId: string; introduction: string; sections: ExplorationSection[]; topics: ExamTopic[]; questions: { exerciseId: string; topicId: string }[]; sources: { title: string; url: string }[] };

export function validateExplorationLesson(value: unknown, lesson: Lesson, content: Content): ExplorationLesson {
  function fail(message: string): never { throw new Error(`Lesson reader: ${message}`); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('expected an object.');
  const row = value as ExplorationLesson;
  if (row.lessonId !== lesson.id || !text(row.introduction)) fail('lessonId or introduction is invalid.');
  const diagrams = ['address', 'sun', 'scale', 'models', 'neighbour', 'galaxy', 'universe', 'recap'];
  checkRows(row.sections, { id: text, title: text, glaux: text, paragraphs: v => Array.isArray(v) && v.length > 0 && v.every(text), diagram: v => diagrams.includes(String(v)) }, 'sections');
  checkRows(row.topics, { id: text, title: text, reviewSection: text, secureLine: text, reviewLine: text }, 'topics');
  checkRows(row.questions, { exerciseId: text, topicId: text }, 'questions');
  checkRows(row.sources, { title: text, url: v => typeof v === 'string' && /^https:\/\//.test(v) }, 'sources');
  if (row.sections.length < 2 || new Set(row.sections.map(s => s.id)).size !== row.sections.length) fail('sections need unique IDs.');
  if (!row.topics.length || new Set(row.topics.map(t => t.id)).size !== row.topics.length) fail('topics need unique IDs.');
  const exerciseIds = lesson.cards.flatMap(card => card.kind === 'exercise' ? [card.exerciseId] : []);
  if (row.questions.length !== exerciseIds.length || !row.questions.length || new Set(row.questions.map(q => q.exerciseId)).size !== exerciseIds.length) fail('exam must cover every exercise once.');
  for (const q of row.questions) {
    const exercise = content.exercises.find(e => e.id === q.exerciseId);
    if (!exerciseIds.includes(q.exerciseId) || exercise?.cellId !== lesson.cellId || !['choice', 'order'].includes(exercise.type)) fail('unknown exam exercise.');
    if (!row.topics.some(t => t.id === q.topicId)) fail('unknown exam topic.');
  }
  for (const t of row.topics) {
    if (!row.sections.some(s => s.id === t.reviewSection)) fail('unknown review section.');
    if (row.questions.filter(q => q.topicId === t.id).length < 2) fail('each topic needs at least two questions.');
  }
  return row;
}

export async function loadExplorationLesson(lesson: Lesson, content: Content, read: typeof fetch = fetch) {
  if (!lesson.reader || !/^\/content\/[a-zA-Z0-9/_-]+\.json$/.test(lesson.reader)) throw new Error('This lesson needs a local content file.');
  const response = await read(lesson.reader);
  if (!response.ok) throw new Error('The lesson could not be loaded. Please try again.');
  return validateExplorationLesson(await response.json(), lesson, content);
}
