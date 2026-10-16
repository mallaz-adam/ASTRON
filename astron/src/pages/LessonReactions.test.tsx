import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { newReactionMemory, reactGlaux } from '../logic/glauxReactions';
import { LessonGlaux } from './LessonGlaux';
import { LessonExercise } from './LessonExercise';

const content = sampleContent();
const exercise = content.exercises.find(row => row.id === 'ex-03-order')!;
const callbacks = { select: () => {}, undo: () => {}, check: () => {}, reveal: () => {}, hint: () => {} };

describe('Visible lesson reactions', () => {
  it('uses the cheering picture, one live speech box, the callback and five decorative sneeze stars', () => {
    const { reaction } = reactGlaux({ event: 'firstTryRight', pools: content.glauxLines, memory: newReactionMemory(), exercise, hunch: 'blue', sneezeRoll: 0 });
    const html = renderToStaticMarkup(<LessonGlaux mood={reaction.mood} lines={reaction.lines} reaction={reaction} reduceMotion={false} />);
    expect(html).toContain('Glaux the owl, cheering');
    expect(html).toContain('aria-atomic="true"');
    expect(html.match(/class="speech-box"/g)).toHaveLength(1);
    expect(html.match(/--drift-x:/g)).toHaveLength(5);
    expect(html).toContain('You picked blue at the start. Nose for the truth.');
    expect(html).toContain('Excuse me. Stardust.');
  });
  it('keeps all sneeze and callback words with Reduce motion while omitting particles', () => {
    const { reaction } = reactGlaux({ event: 'firstTryRight', pools: content.glauxLines, memory: newReactionMemory(), exercise, hunch: 'red', sneezeRoll: 0 });
    const html = renderToStaticMarkup(<LessonGlaux mood={reaction.mood} lines={reaction.lines} reaction={reaction} reduceMotion />);
    expect(html).toContain('Excuse me. Stardust.');
    expect(html).toContain('You started with red, then reasoned your way here.');
    expect(html).not.toContain('class="sneeze-stars"');
    for (const line of reaction.lines) expect(html).toContain(line.replaceAll("'", '&#x27;'));
  });
  it('keeps missed discs in slots, gives an empty ladder and offers Undo and hint', () => {
    const html = renderToStaticMarkup(<LessonExercise {...callbacks} exercise={exercise} busy={false}
      answer={{ selection: ['blue', 'orange', 'red'], attempts: 1, status: 'missed', hintUsed: false }} />);
    expect(html).toContain('heat-ladder--faint');
    expect(html.match(/data-star=/g)).toHaveLength(3);
    expect(html).not.toContain('colour-disc heat-star');
    expect(html).toContain('aria-hidden="true" style="--clue-delay:');
    expect(html).toContain('>UNDO<'); expect(html).toContain('>HINT<');
    expect(html).not.toContain('SHOW ME');
  });
  it('reveals SHOW ME after two misses, and fills the ladder after a right or revealed answer', () => {
    const missed = renderToStaticMarkup(<LessonExercise {...callbacks} exercise={exercise} busy={false}
      answer={{ selection: ['blue', 'red', 'orange'], attempts: 2, status: 'missed', hintUsed: false }} />);
    expect(missed).toContain('>SHOW ME<');
    for (const status of ['correct', 'revealed'] as const) {
      const html = renderToStaticMarkup(<LessonExercise {...callbacks} exercise={exercise} busy={false}
        answer={{ selection: ['red', 'orange', 'blue'], attempts: 2, status, hintUsed: false }} />);
      expect(html.match(/colour-disc heat-star/g)).toHaveLength(3);
      expect(html).toContain('hotter'); expect(html).toContain('cooler');
      expect(html).not.toContain('heat-ladder--faint');
      expect(html.indexOf('class="heat-rungs"')).toBeLessThan(html.lastIndexOf('Red star'));
    }
  });
});
