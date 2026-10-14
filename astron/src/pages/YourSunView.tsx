import { Link } from 'react-router-dom';
import { Page } from '../design/Page';
import { SunDial } from '../design/SunDial';
import { GlauxArt, TierArt } from '../design/InlineArt';
import { SpeechBox } from '../design/SpeechBox';
import type { SunModel } from '../logic/sun';
import { useDesktopLayout } from '../hooks/useDesktopLayout';
import { TodayTabs } from './TodayTabs';
import './Today.css';
import './YourSun.css';

const stages = [
  { stage: 'dawn', label: 'Dawn', range: '1 to 6 days' },
  { stage: 'morning', label: 'Morning', range: '7 to 29 days' },
  { stage: 'noon', label: 'Noon', range: '30 to 99 days' },
  { stage: 'corona', label: 'Corona', range: '100 or more days' },
] as const;

export function YourSunView({ model }: { model: SunModel }) {
  const desktop = useDesktopLayout();
  return <Page className="sun-page" reduceMotion={model.reduceMotion} skipLabel="Your sun">
    <main id="main-content" className="sun-main" tabIndex={-1}>
      {desktop && <TodayTabs />}
      <Link className="sun-back" to="/">Back to Today</Link>
      <h1>Your sun</h1>
      <div className="sun-dial-block"><SunDial model={model} /><p>{model.sentence}</p></div>
      <div className="sun-details">
        <div className="sun-tiers">
          {stages.map(tier => <div key={tier.stage} className={`sun-tier${model.ring.stage === tier.stage ? ' sun-tier--current' : ''}`} aria-current={model.ring.stage === tier.stage ? 'step' : undefined}>
            <TierArt stage={tier.stage} /><span className="sun-tier-name">{tier.label}</span><span className="sun-tier-range">{tier.range}</span>
          </div>)}
        </div>
        <dl className="sun-stats">
          <div><dt>LONGEST STREAK</dt><dd>{model.longest} days</dd></div>
          <div><dt>FREEZES</dt><dd>{model.freezesLeft} ready</dd></div>
        </dl>
        <div className="sun-speech"><GlauxArt mood="proud" /><SpeechBox>{model.speech}</SpeechBox></div>
      </div>
      {!desktop && <TodayTabs />}
    </main>
  </Page>;
}
