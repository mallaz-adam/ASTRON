import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { unitReadingPosition, unitReadingSequence } from './unitReadingProgress';

const load = (name: string) => JSON.parse(readFileSync(new URL(`../../public/content/${name}.json`, import.meta.url), 'utf8'));

describe('One reading position across teaching and practice', () => {
  it('counts the introduction, ten teaching screens and two practices in Unit 1', () => {
    const data = load('earth-sun-moon');
    const sequence = unitReadingSequence(data.lessonId, data.steps, false);
    expect(sequence).toHaveLength(13);
    const position = (index: number, practicing = false) => unitReadingPosition(sequence, { index, practicing, question: 0, finished: false }).current;
    expect(position(-1)).toBe(1);
    expect(position(5)).toBe(7);
    expect(position(5, true)).toBe(8);
    expect(position(6)).toBe(9);
    expect(position(8, true)).toBe(12);
    expect(position(9)).toBe(13);
    // Going back gives the same position; it never awards progress or a score.
    expect(position(5, true)).toBe(8);
    expect(unitReadingPosition(sequence, { index: 9, practicing: false, question: 0, finished: true })).toMatchObject({ current: 13, total: 13 });
  });
  it('includes the separate recap and every evidence question in the galaxy unit', () => {
    const data = load('galaxies-universe');
    const sequence = unitReadingSequence(data.lessonId, data.steps, true, { reconstruction: data.evidence.questions.length });
    const index = data.steps.findIndex((step: { scene: string }) => step.scene === 'reconstruction');
    const questions = data.evidence.questions.map((_: unknown, question: number) => unitReadingPosition(sequence, { index, practicing: true, question, finished: false }).current);
    expect(questions).toHaveLength(data.evidence.questions.length);
    expect(sequence).toHaveLength(16);
    expect(questions.every((position: number, i: number) => i === 0 || position === questions[i - 1] + 1)).toBe(true);
    expect(unitReadingPosition(sequence, { index: data.steps.length, practicing: false, question: 0, finished: false })).toMatchObject({ current: sequence.length, kind: 'recap' });
  });
  it.each([['our-solar-system', 13], ['stars-milky-way', 14]] as const)('keeps %s on the same continuous counter', (name, total) => {
    const data = load(name);
    const sequence = unitReadingSequence(data.lessonId, data.steps, Boolean(data.recap));
    expect(sequence).toHaveLength(total);
    expect(unitReadingPosition(sequence, { index: -1, practicing: false, question: 0, finished: false }).current).toBe(1);
    expect(unitReadingPosition(sequence, { index: 0, practicing: false, question: 0, finished: true })).toMatchObject({ current: total, total });
  });
  it('keeps every state uniquely addressable without a second practice counter', () => {
    const sequence = unitReadingSequence('unit-earth-sun-moon', load('earth-sun-moon').steps, false);
    for (const [i, state] of sequence.entries()) {
      expect(unitReadingPosition(sequence, { index: state.index, practicing: state.kind === 'practice', question: state.question, finished: false }).current).toBe(i + 1);
    }
    expect(() => unitReadingPosition(sequence, { index: 0, practicing: true, question: 0, finished: false })).toThrow('not in the unit');
  });
});
