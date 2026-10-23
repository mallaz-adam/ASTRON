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
        <GlauxArt key={`${mood}-${reaction?.id ?? 'initial'}`} mood={mood} className={`lesson-glaux${reaction && !reduceMotion ? ' lesson-glaux--response' : ''}`} />
      </span>
      <SpeechBox><div role="status" aria-live="polite" aria-atomic="true">
        {reaction?.callback && <p className="hunch-callback">{reaction.callback}</p>}
        {lines.map((line, index) => <p key={index}>{line}</p>)}
      </div></SpeechBox>
    </div>
  </div>;
}
