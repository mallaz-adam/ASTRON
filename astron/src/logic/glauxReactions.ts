import type { Exercise, GlauxLinePool, GlauxMood, GlauxPoolId, HunchChoice } from '../data/types';

export type ReactionEvent = 'firstTryRight' | 'rightAfterMisses' | 'rightWithHint' | 'missed' | 'hint' | 'showMe' | 'hunch';
export type ReactionMemory = { lastLines: Partial<Record<GlauxPoolId, string>>; lastRightSneezed: boolean; sequence: number };
export type GlauxReaction = { id: number; mood: GlauxMood; lines: string[]; callback?: string; sneeze: boolean; sneezeLine?: string };

export function newReactionMemory(): ReactionMemory {
  return { lastLines: {}, lastRightSneezed: false, sequence: 0 };
}

export function rightEvent(answer: { attempts: number; hintUsed: boolean }): ReactionEvent {
  if (answer.hintUsed) return 'rightWithHint';
  return answer.attempts === 1 ? 'firstTryRight' : 'rightAfterMisses';
}

// Random values are inputs, so the rules can be tested without clocks or chance.
export function reactGlaux({ event, pools, memory, exercise, hunch, lineRoll = 0, sneezeRoll = 1 }: {
  event: ReactionEvent; pools: readonly GlauxLinePool[]; memory: ReactionMemory;
  exercise?: Exercise; hunch?: HunchChoice; lineRoll?: number; sneezeRoll?: number;
}): { reaction: GlauxReaction; memory: ReactionMemory } {
  const next = { ...memory, lastLines: { ...memory.lastLines }, sequence: memory.sequence + 1 };
  function line(id: GlauxPoolId) {
    const pool = pools.find(row => row.id === id)!.lines;
    const alternatives = pool.filter(value => value !== next.lastLines[id]);
    const choices = alternatives.length ? alternatives : pool;
    const roll = Number.isFinite(lineRoll) ? Math.max(0, Math.min(lineRoll, 1)) : 0;
    const selected = choices[Math.min(Math.floor(roll * choices.length), choices.length - 1)];
    next.lastLines[id] = selected;
    return selected;
  }
  const moods: Record<ReactionEvent, GlauxMood> = {
    firstTryRight: 'cheering', rightAfterMisses: 'proud', rightWithHint: 'proud',
    missed: 'gentle', hint: 'thinking', showMe: 'thinking', hunch: 'happy',
  };
  const right = ['firstTryRight', 'rightAfterMisses', 'rightWithHint'].includes(event);
  let lines: string[];
  if (event === 'hint') lines = [exercise!.hint];
  else if (event === 'hunch') {
    const id = { blue: 'hunchBlue', orange: 'hunchOrange', red: 'hunchRed', skipped: 'hunchSkip' } as const;
    lines = [line(id[hunch!])];
  } else {
    lines = [line(event)];
    if (right) lines.push(exercise!.rightLine);
    if (event === 'missed') lines.push(exercise!.missedLine);
  }
  let callback: string | undefined;
  if (right && exercise?.id === 'ex-03-order') {
    if (hunch === 'blue') callback = line('orderCallbackBlue');
    if (hunch === 'orange' || hunch === 'red') callback = line('orderCallbackOther').replace('{colour}', hunch);
  }
  const sneeze = right && !memory.lastRightSneezed && sneezeRoll >= 0 && sneezeRoll < .2;
  if (right) next.lastRightSneezed = sneeze;
  const sneezeLine = sneeze ? line('sneeze') : undefined;
  return { reaction: { id: next.sequence, mood: moods[event], lines, callback, sneeze, sneezeLine }, memory: next };
}
