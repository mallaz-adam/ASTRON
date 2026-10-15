import { contentError, object, text } from './contentSchema';
import type { Exercise } from './types';

// These are authoring shapes, not grading or learning-screen code.
export function validateExercise(exercise: Exercise, file: string, index: number) {
  const data = exercise.contentData;
  const field = `[${index}].contentData`;
  function fail(name: string, message: string): never { return contentError(file, `${field}.${name}`, message); }
  function items(name: string) {
    const value = data[name];
    if (!Array.isArray(value) || value.length < 2) fail(name, 'expected at least two items.');
    const ids = value.map((item, itemIndex) => {
      if (!object(item) || !text((item as Record<string, unknown>).id) || !text((item as Record<string, unknown>).text)) {
        fail(`${name}[${itemIndex}]`, 'expected { id, text }.');
      }
      const colour = (item as Record<string, unknown>).colour;
      if (colour !== undefined && (typeof colour !== 'string' || !/^#[0-9a-f]{6}$/i.test(colour))) fail(`${name}[${itemIndex}].colour`, 'expected a six-digit hex colour.');
      return (item as { id: string }).id;
    });
    if (new Set(ids).size !== ids.length) fail(name, 'item ids must be unique.');
    return ids;
  }
  if (exercise.type === 'choice' || exercise.type === 'find') {
    const ids = items(exercise.type === 'choice' ? 'options' : 'items');
    const key = exercise.type === 'choice' ? 'correctOptionId' : 'targetId';
    if (!text(data[key]) || !ids.includes(data[key] as string)) fail(key, 'must name an existing item id.');
  }
  if (exercise.type === 'order') {
    const ids = items('items');
    const order = data.correctOrder;
    if (!Array.isArray(order) || order.length !== ids.length || new Set(order).size !== ids.length || !order.every(id => typeof id === 'string' && ids.includes(id))) {
      fail('correctOrder', 'must list every item id exactly once.');
    }
  }
  if (exercise.type === 'connect') {
    const pairs = data.pairs;
    if (!Array.isArray(pairs) || pairs.length < 2) fail('pairs', 'expected at least two pairs.');
    pairs.forEach((pair, pairIndex) => {
      if (!object(pair) || !text((pair as Record<string, unknown>).left) || !text((pair as Record<string, unknown>).right)) {
        fail(`pairs[${pairIndex}]`, 'expected { left, right }.');
      }
    });
  }
  if (exercise.type === 'estimate') {
    for (const name of ['min', 'max', 'answer', 'tolerance']) {
      if (typeof data[name] !== 'number' || !Number.isFinite(data[name])) fail(name, 'expected a finite number.');
    }
    if ((data.min as number) >= (data.max as number)) fail('max', 'must be greater than min.');
    if ((data.answer as number) < (data.min as number) || (data.answer as number) > (data.max as number)) fail('answer', 'must be inside min and max.');
    if ((data.tolerance as number) < 0) fail('tolerance', 'must be zero or greater.');
  }
}
