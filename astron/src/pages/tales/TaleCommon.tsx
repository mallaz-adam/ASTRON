import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { GlauxMood } from '../../data/types';
import type { TaleExperienceData } from '../../data/taleExperience';
import { GlauxArt } from '../../design/InlineArt';
import { SpeechBox } from '../../design/SpeechBox';
import { DiscoveryDetails } from '../../design/DiscoveryDetails';

export function TaleHeader({ context = 'Orion, the Hunter', closeTo }: { context?: string; closeTo?: string }) {
  return <header className="tale-header">
    {closeTo && <Link to={closeTo} className="tale-close" aria-label="Close story"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></Link>}
    <Link to="/" className="tale-wordmark">ASTRON<img src="/art/star.svg" width="20" height="20" alt="" /></Link>
    <span className="tale-context">{context}</span>
  </header>;
}

export function TaleGlaux({ children, mood = 'thinking' }: { children: ReactNode; mood?: GlauxMood }) {
  return <div className="tale-glaux"><GlauxArt mood={mood} /><SpeechBox>{children}</SpeechBox></div>;
}

export function ReadingText({ text }: { text: string }) {
  return <div className="tale-prose">{text.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph.replace(/\n/g, ' ')}</p>)}</div>;
}

export function SourceText({ text }: { text: string }) {
  return <div className="tale-prose">{text.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph.split(/(https:\/\/\S+)/).map((part, item) => part.startsWith('https://') ? <a key={item} href={part} target="_blank" rel="noreferrer">{part}</a> : part)}</p>)}</div>;
}

export function TaleSources({ data }: { data: TaleExperienceData }) {
  return <DiscoveryDetails className="tale-sources" detailId={`tale:${data.taleId}:sources`} label="Sources"><div>
    <p>This is one version of the myth. The drawings show the imagined hunter. The chart shows where the stars appear from Earth.</p>
    <ul>{data.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul>
    <p>Artwork adapted from images supplied for ASTRON. The welcome painting includes an AI-assisted edit. The hunter illustration retains the supplied linework.</p>
    <p>Essential story and source notes are saved with the app. External source pages need an internet connection.</p>
  </div></DiscoveryDetails>;
}

export function CoverImage({ className = '', description = 'Two companions in a painted valley, one looking through a handheld telescope beneath the stars.' }: { className?: string; description?: string }) {
  return <img className={`tale-cover-image ${className}`} src="/art/orion/cover-640.webp" srcSet="/art/orion/cover-640.webp 640w, /art/orion/cover-1280.webp 1086w" sizes="(min-width: 900px) 56vw, calc(100vw - 48px)" width="1086" height="1448" alt={description} fetchPriority="high" />;
}
