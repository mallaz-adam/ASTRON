import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { newReactionMemory, reactGlaux, rightEvent } from './glauxReactions';
import type { ReactionEvent } from './glauxReactions';

const content = sampleContent();
const exercise = content.exercises.find(row => row.id === 'ex-03-order')!;
const pools = content.glauxLines;
const options = { pools, exercise, memory: newReactionMemory(), lineRoll: 0 };

describe('Glaux reactions', () => {
  it.each([
    ['firstTryRight', 'proud', "You noticed the clue.", exercise.rightLine],
    ['rightAfterMisses', 'proud', 'You looked again, and the picture became clearer.', exercise.rightLine],
    ['rightWithHint', 'proud', 'A clue helped you see the pattern.', exercise.rightLine],
    ['missed', 'gentle', 'Let us look a little closer.', exercise.missedLine],
    ['hint', 'thinking', exercise.hint],
    ['showMe', 'thinking', "Follow the clues with me."],
  ])('uses the approved mood and lines for %s', (event, mood, ...lines) => {
    const result = reactGlaux({ ...options, event: event as ReactionEvent });
    expect(result.reaction.mood).toBe(mood);
    expect(result.reaction.lines).toEqual(lines);
    expect(result.reaction.lines.length).toBeLessThanOrEqual(2);
  });
  it.each([
    ['blue', "Keep blue in mind. Let us follow the clues."], ['orange', "Keep orange in mind. Let us follow the clues."],
    ['red', 'Keep red in mind. Let us follow the clues.'], ['skipped', 'Then we shall begin by looking.'],
  ] as const)('uses the exact %s hunch response without grading it', (hunch, text) => {
    const { reaction } = reactGlaux({ ...options, event: 'hunch', hunch });
    expect(reaction).toMatchObject({ mood: 'happy', lines: [text] });
    expect(reaction.callback).toBeUndefined();
  });
  it.each(['firstTryRight', 'missed'] as const)('never repeats consecutive %s pool choices, even with the same random input', event => {
    let memory = newReactionMemory();
    let previous = '';
    for (let index = 0; index < 12; index++) {
      const result = reactGlaux({ ...options, event, memory });
      expect(result.reaction.lines[0]).not.toBe(previous);
      previous = result.reaction.lines[0]; memory = result.memory;
    }
  });
  it('remembers each pool across hints and permits a single-line pool to repeat', () => {
    const first = reactGlaux({ ...options, event: 'missed' });
    const hint = reactGlaux({ ...options, event: 'hint', memory: first.memory });
    expect(reactGlaux({ ...options, event: 'missed', memory: hint.memory }).reaction.lines[0]).not.toBe(first.reaction.lines[0]);
    const one = reactGlaux({ ...options, event: 'rightAfterMisses' });
    expect(reactGlaux({ ...options, event: 'rightAfterMisses', memory: one.memory }).reaction.lines).toEqual(one.reaction.lines);
  });
  it.each([
    ['blue', 'You kept blue in mind, then followed the clues.'],
    ['orange', "You began with orange. Looking closely gave you another answer."],
    ['red', "You began with red. Looking closely gave you another answer."],
    ['skipped', undefined], [undefined, undefined],
  ] as const)('adds the %s hunch callback only to a right order', (hunch, callback) => {
    const result = reactGlaux({ ...options, event: 'firstTryRight', hunch });
    expect(result.reaction.callback).toBe(callback);
    expect(reactGlaux({ ...options, event: 'missed', hunch }).reaction.callback).toBeUndefined();
    const choice = content.exercises.find(row => row.id === 'ex-03-choice')!;
    expect(reactGlaux({ ...options, exercise: choice, event: 'firstTryRight', hunch }).reaction.callback).toBeUndefined();
  });
  it('keeps a successful hunch callback within the two-paragraph speech budget', () => {
    for (const hunch of ['blue', 'orange', 'red', 'skipped'] as const) {
      const { reaction } = reactGlaux({ ...options, event: 'firstTryRight', hunch });
      expect(reaction.lines.length + (reaction.callback ? 1 : 0)).toBeLessThanOrEqual(2);
      expect(reaction.mood).toBe('proud');
      expect(reaction).not.toHaveProperty('sneeze');
      expect(reaction).not.toHaveProperty('sneezeLine');
    }
  });
  it('distinguishes a first try, a retry and a requested hint without changing assessment attempts', () => {
    expect(rightEvent({ attempts: 1, hintUsed: false })).toBe('firstTryRight');
    expect(rightEvent({ attempts: 2, hintUsed: false })).toBe('rightAfterMisses');
    expect(rightEvent({ attempts: 1, hintUsed: true })).toBe('rightWithHint');
    expect(rightEvent({ attempts: 4, hintUsed: true })).toBe('rightWithHint');
  });
  it('is deterministic, leaves its inputs untouched, and chooses both approved variants', () => {
    const original = JSON.stringify(options);
    const input = { ...options, event: 'firstTryRight' as const };
    expect(reactGlaux(input)).toEqual(reactGlaux(input));
    expect(JSON.stringify(options)).toBe(original);
    expect(reactGlaux({ ...input, lineRoll: 1 }).reaction.lines[0]).toBe('The pattern is clearer now.');
  });
  it.each([
    ['dialRedEnd', "Cooler, yes. Even a red star is fiercely hot."],
    ['gapFlagFew', "A few million years. Brief, on a star's scale."],
    ['gapFlagTen', "About ten billion years. Let that distance in time settle."],
  ] as const)('uses the happy %s interaction line without an exercise or reward', (event, text) => {
    const { reaction } = reactGlaux({ pools, memory: newReactionMemory(), event });
    expect(reaction).toMatchObject({ mood: 'happy', lines: [text] });
    expect(reaction.callback).toBeUndefined();
  });
});
