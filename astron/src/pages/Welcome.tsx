import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { acknowledgeIntroduction } from '../data/welcomeServices';
import { temporaryProgress } from '../data/progressMode';
import { needsIntroduction } from '../logic/taleJourney';
import { Page } from '../design/Page';
import { Button } from '../design/Button';
import { GlauxArt } from '../design/InlineArt';
import { TaleExperience } from './tales/TaleExperience';
import { NavigationIcon } from './TodayTabs';
import './Welcome.css';

export function WelcomeView({ reduceMotion = false, busy = false, error = '', review = false, onBegin }: {
  reduceMotion?: boolean; busy?: boolean; error?: string; review?: boolean; onBegin: () => void;
}) {
  return <Page className="welcome-page" reduceMotion={reduceMotion} skipLabel="Skip to welcome"><main id="main-content" className="welcome-main" tabIndex={-1}>
    <p className="welcome-wordmark">ASTRON <img src="/art/star.svg" width="20" height="20" alt="" /></p>
    <header className="welcome-heading"><h1>Welcome to ASTRON</h1><p>Explore the sky through small lessons, Greek stories and scientific articles.</p></header>
    <div className="welcome-guide"><GlauxArt mood="gentle" /><p>I am Glaux. Let us find our way through the sky.</p></div>
    <div className="welcome-ways">{[
      ['Learn', 'Try a small idea, move a star, and see what changes.'],
      ['Stories', 'Follow a Greek myth, then find its pattern in the sky.'],
      ['Articles', 'Follow a question and discover the science behind it.'],
    ].map(([label, text]) => <section key={label}><NavigationIcon label={label} /><h2>{label}</h2><p>{text}</p></section>)}</div>
    <p className="welcome-orientation">Today keeps your daily activities together. My sky holds the stars you collect.</p>
    <section className="welcome-first"><img src="/art/orion/cover-640.webp" width="640" height="853" decoding="async" alt="A painted valley beneath a starry sky." /><div><h2>Begin with Orion</h2><p>A story, a star, and a first pattern to find.</p></div>{review ? <Link to="/" className="atlas-button atlas-button--primary">Back to ASTRON</Link> : <Button disabled={busy} onClick={onBegin}>Meet Orion</Button>}</section>
    {review && temporaryProgress && <a className="article-open" href="/start">Start from the beginning</a>}
    <p className="welcome-privacy">{temporaryProgress ? 'Development preview. Progress is temporary. Refresh to start from the beginning. No account is needed.' : 'Your progress stays on this device. No account is needed.'}</p>
    {error && <p role="alert">{error}</p>}
  </main></Page>;
}

export function Welcome({ review = false }: { review?: boolean }) {
  const { progress, error: loadError } = useProgress();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const writing = useRef(false);
  const showIntroduction = review || Boolean(progress && needsIntroduction(progress));
  useEffect(() => { if (showIntroduction) document.title = 'Welcome · ASTRON'; }, [showIntroduction]);
  async function begin() {
    if (writing.current) return;
    writing.current = true; setBusy(true); setError('');
    try { await acknowledgeIntroduction(db, localLearnerId, new Date()); }
    catch (problem) { setError(problem instanceof Error ? problem.message : String(problem)); }
    finally { writing.current = false; setBusy(false); }
    // The live query switches to Orion only after observing the saved choice.
  }
  if (!progress) return <Page><main id="main-content" aria-busy={!loadError}><h1>Opening the atlas…</h1>{loadError && <p role="alert">{loadError}</p>}</main></Page>;
  if (!showIntroduction) return <TaleExperience welcome />;
  return <WelcomeView review={review} reduceMotion={progress.learners.find(row => row.id === localLearnerId)?.reduceMotion} busy={busy} error={error || loadError} onBegin={() => void begin()} />;
}
