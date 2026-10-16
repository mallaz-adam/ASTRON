import type { CSSProperties } from 'react';
import type { GlauxMood } from '../data/types';
import { GlauxArt } from '../design/InlineArt';
import { SpeechBox } from '../design/SpeechBox';
import type { GlauxReaction } from '../logic/glauxReactions';

export function LessonGlaux({ mood, lines, reaction, reduceMotion }: {
  mood: GlauxMood; lines: string[]; reaction?: GlauxReaction; reduceMotion: boolean;
}) {
  return <div className="lesson-feedback">
    <div className="lesson-speech">
      <span className="lesson-glaux-wrap">
        <GlauxArt key={`${mood}-${reaction?.id ?? 'initial'}`} mood={mood} className="lesson-glaux" />
        {reaction?.sneeze && !reduceMotion && <span className="sneeze-stars" aria-hidden="true" key={reaction.id}>
          {[-30, -16, 0, 16, 30].map((y, index) => <svg key={index} viewBox="0 0 24 24"
            style={{ '--drift-x': `${36 + index * 7}px`, '--drift-y': `${y}px`, '--turn': `${index * 20 - 40}deg` } as CSSProperties}>
            <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />
          </svg>)}
        </span>}
      </span>
      <SpeechBox><div role="status" aria-live="polite" aria-atomic="true">
        {lines.map((line, index) => <p key={index}>{line}</p>)}
        {reaction?.callback && <p className="hunch-callback">{reaction.callback}</p>}
      </div></SpeechBox>
    </div>
    {reaction?.sneezeLine && <p className="sneeze-caption" role="status">{reaction.sneezeLine}</p>}
  </div>;
}
