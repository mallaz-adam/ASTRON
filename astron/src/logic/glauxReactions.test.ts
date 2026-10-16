import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { newReactionMemory, reactGlaux, rightEvent } from './glauxReactions';
import type { ReactionEvent } from './glauxReactions';

const content = sampleContent();
const exercise = content.exercises.find(row => row.id === 'ex-03-order')!;
const pools = content.glauxLines;
const options = { pools, exercise, memory: newReactionMemory(), lineRoll: 0, sneezeRoll: 1 };

describe('Glaux reactions', () => {
  it.each([
    ['firstTryRight', 'cheering', "Ha! Right the first time. I'm taking notes.", exercise.rightLine],
    ['rightAfterMisses', 'proud', 'Stubborn beats speedy. The stars approve.', exercise.rightLine],
    ['rightWithHint', 'proud', 'You took your time on that one. Good. Stars do, too.', exercise.rightLine],
    ['missed', 'gentle', 'Ooh, close. The sky likes to tease.', exercise.missedLine],
    ['hint', 'thinking', exercise.hint],
    ['showMe', 'thinking', "No shame in a peek. Now it's yours."],
  ])('uses the approved mood and lines for %s', (event, mood, ...lines) => {
    const result = reactGlaux({ ...options, event: event as ReactionEvent });
    expect(result.reaction.mood).toBe(mood);
    expect(result.reaction.lines).toEqual(lines);
    expect(result.reaction.lines.length).toBeLessThanOrEqual(2);
    expect(result.reaction.sneeze).toBe(false);
  });
  it.each([
    ['blue', "Bold. Let's see if the sky agrees."], ['orange', "The diplomat's choice."],
    ['red', 'Fire is red, so I see your logic.'], ['skipped', 'Fair. Wise people read the map first.'],
  ] as const)('uses the exact %s hunch response without grading it', (hunch, text) => {
    const { reaction } = reactGlaux({ ...options, event: 'hunch', hunch, sneezeRoll: 0 });
    expect(reaction).toMatchObject({ mood: 'happy', lines: [text], sneeze: false });
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
    ['blue', 'You picked blue at the start. Nose for the truth.'],
    ['orange', "You started with orange, then reasoned your way here. That's the better trick."],
    ['red', "You started with red, then reasoned your way here. That's the better trick."],
    ['skipped', undefined], [undefined, undefined],
  ] as const)('adds the %s hunch callback only to a right order', (hunch, callback) => {
    const result = reactGlaux({ ...options, event: 'firstTryRight', hunch });
    expect(result.reaction.callback).toBe(callback);
    expect(reactGlaux({ ...options, event: 'missed', hunch }).reaction.callback).toBeUndefined();
    const choice = content.exercises.find(row => row.id === 'ex-03-choice')!;
    expect(reactGlaux({ ...options, exercise: choice, event: 'firstTryRight', hunch }).reaction.callback).toBeUndefined();
  });
  it('selects the twenty-percent sneeze range but never two right answers in a row', () => {
    const first = reactGlaux({ ...options, event: 'firstTryRight', sneezeRoll: .199 });
    expect(first.reaction).toMatchObject({ sneeze: true, sneezeLine: 'Excuse me. Stardust.' });
    const miss = reactGlaux({ ...options, event: 'missed', sneezeRoll: 0, memory: first.memory });
    expect(miss.reaction.sneeze).toBe(false);
    const second = reactGlaux({ ...options, event: 'rightAfterMisses', sneezeRoll: 0, memory: miss.memory });
    expect(second.reaction.sneeze).toBe(false);
    expect(reactGlaux({ ...options, event: 'rightWithHint', sneezeRoll: 0, memory: second.memory }).reaction.sneeze).toBe(true);
    expect(reactGlaux({ ...options, event: 'firstTryRight', sneezeRoll: .2 }).reaction.sneeze).toBe(false);
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
    expect(reactGlaux({ ...input, lineRoll: 1 }).reaction.lines[0]).toBe('Clean, like a comet with a plan.');
  });
});
