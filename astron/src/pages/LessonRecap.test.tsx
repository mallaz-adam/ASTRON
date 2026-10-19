import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { newReactionMemory, reactGlaux } from '../logic/glauxReactions';
import { starColours } from '../logic/stars';
import { LessonRecap } from './LessonRecap';
import { LessonGlaux } from './LessonGlaux';

const content = sampleContent();
const card = content.lessons.find(row => row.id === 'lesson-03')!.cards.at(-1)!;
const items = card.kind === 'recap' ? card.items : [];

describe('Constellation ending', () => {
  it('keeps all three recap clues without claiming a star before completion', () => {
    const html = renderToStaticMarkup(<LessonRecap items={items} finished={false} hunch="blue" reduceMotion={false} />);
    for (const item of items) expect(html).toContain(item);
    expect(html).not.toContain('Added to your sky');
    expect(html).not.toContain('lesson-clues--drawing');
  });
  it.each(['blue', 'orange', 'red', 'skipped'] as const)('shows the finished %s picture and all copy under Reduce motion', hunch => {
    const tint = hunch === 'skipped' ? 'gold' : hunch;
    const html = renderToStaticMarkup(<LessonRecap items={items} finished hunch={hunch} reduceMotion />);
    expect(html).toContain(`data-tint="${tint}"`);
    expect(html).toContain(starColours[tint]);
    expect(html).toContain('Added to your sky');
    expect(html).toContain('role="status"');
    for (const item of items) expect(html).toContain(item);
    expect(html).not.toContain('lesson-clues--drawing');
    const { reaction } = reactGlaux({ event: 'ending', hunch, pools: content.glauxLines, memory: newReactionMemory() });
    expect(reaction.mood).toBe('proud');
    expect(reaction.sneeze).toBe(false);
    expect(reaction.lines).toEqual([
      content.glauxLines.find(pool => pool.id === (hunch === 'skipped' ? 'endingSkipped' : 'endingHunch'))!.lines[0],
      content.glauxLines.find(pool => pool.id === 'endingTease')!.lines[0],
    ]);
    const speech = renderToStaticMarkup(<LessonGlaux mood={reaction.mood} lines={reaction.lines} reduceMotion />);
    expect(speech).toContain('Glaux the owl, proud');
    expect(speech).toContain('class="happy-eyes"');
    expect(speech).not.toContain('right on the first try');
  });
});
