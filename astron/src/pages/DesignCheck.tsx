import { useState } from 'react';
import { Page } from '../design/Page';
import { Button } from '../design/Button';
import { Chip } from '../design/Chip';
import { SpeechBox } from '../design/SpeechBox';
import { QuestRow } from '../design/QuestRow';
import { Toggle } from '../design/Toggle';
import { ProgressSegments } from '../design/ProgressSegments';
import './DesignCheck.css';

const palette = [
  ['parchment', 'Page'], ['card', 'Cards'], ['panel', 'Panels'],
  ['track', 'Progress track'], ['line', 'Thin lines'], ['ink', 'Ink'],
  ['soft-ink', 'Soft ink'], ['vermilion', 'Vermilion'], ['lapis', 'Lapis'],
  ['lapis-light', 'Light lapis'], ['gold', 'Gold'], ['gold-light', 'Light gold'],
  ['gold-deep', 'Deep gold'], ['terracotta', 'Terracotta'], ['terracotta-deep', 'Deep terracotta'],
] as const;

export function DesignCheck() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [sampleSwitch, setSampleSwitch] = useState(true);
  const [selectedChips, setSelectedChips] = useState(['Selected']);
  const [buttonMessage, setButtonMessage] = useState('Try a button. Nothing here changes your progress.');

  function toggleChip(label: string) {
    setSelectedChips(current => current.includes(label)
      ? current.filter(item => item !== label)
      : [...current, label]);
  }

  return (
    <Page reduceMotion={reduceMotion}>
      <header className="sheet-header">
        <a className="wordmark" href="#main-content" aria-label="ASTRON — design check">ASTRON</a>
        <span className="eyebrow">An atlas in the making</span>
      </header>

      <main id="main-content" tabIndex={-1}>
        <div className="sheet-intro">
          <div>
            <p className="eyebrow">Field sheet · 001</p>
            <h1>Design check</h1>
            <p className="intro-copy">Paper, ink, and a little light. A quiet place to check the pieces before we build the sky.</p>
          </div>
          <svg className="atlas-emblem" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="42" />
            <circle cx="50" cy="50" r="34" />
            <path d="M50 12v76M12 50h76M23 23l54 54M23 77l54-54" />
            <path className="emblem-star" d="M50 27l6 17 17 6-17 6-6 17-6-17-17-6 17-6z" />
          </svg>
        </div>

        <div className="specimen-grid">
          <section className="sheet-section" aria-labelledby="palette-heading">
            <div className="section-heading"><span className="section-number">I</span><h2 id="palette-heading">The palette</h2></div>
            <p className="section-note">Gold is for decoration. Every name below is written in ink.</p>
            <div className="palette-grid">
              {palette.map(([token, name]) => (
                <div className="swatch" key={token}>
                  <span className="swatch-colour" style={{ backgroundColor: `var(--${token})` }} aria-hidden="true" />
                  <span>{name}</span><span className="swatch-token">{token}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="sheet-section" aria-labelledby="type-heading">
            <div className="section-heading"><span className="section-number">II</span><h2 id="type-heading">Letters &amp; lines</h2></div>
            <p className="section-note">Cinzel for labels. IM Fell English for the stories.</p>
            <div className="type-specimens">
              <div><p className="sample-note">Cinzel · 13 px</p><p className="font-cinzel size-13">A little sky, every day</p></div>
              <div><p className="sample-note">Cinzel · 18 px</p><p className="font-cinzel size-18">ASTRON</p></div>
              <div><p className="sample-note">IM Fell English · italic · 36 px</p><p className="font-fell italic size-36">Under the same sky</p></div>
              <div><p className="sample-note">IM Fell English · italic · 30 px</p><p className="font-fell italic size-30">A map of small wonders</p></div>
              <div><p className="sample-note">IM Fell English · italic · 25 px</p><p className="font-fell italic size-25">Begin with one star</p></div>
              <div><p className="sample-note">IM Fell English · 20 / 18 / 15 px</p><p className="size-20">Look up. There is time.</p><p className="size-18">One small idea can open a whole sky.</p><p className="size-15">A quiet note in the margin.</p></div>
            </div>
          </section>

          <section className="sheet-section" aria-labelledby="controls-heading">
            <div className="section-heading"><span className="section-number">III</span><h2 id="controls-heading">Choices &amp; actions</h2></div>
            <div className="specimen-stack">
              <div>
                <h3>Buttons</h3>
                <div className="control-row">
                  <Button onClick={() => setButtonMessage('The primary button works. A small beginning.')}>Primary</Button>
                  <Button variant="secondary" onClick={() => setButtonMessage('The secondary button works. Take your time.')}>Secondary</Button>
                </div>
                <div className="control-row">
                  <Button disabled>Disabled</Button>
                  <Button variant="secondary" disabled>Disabled</Button>
                </div>
                <p className="interaction-note" role="status">{buttonMessage}</p>
              </div>
              <div>
                <h3>Chips</h3>
                <div className="control-row" role="group" aria-label="Chip specimens">
                  {['Selected', 'Unselected'].map(label => (
                    <Chip key={label} selected={selectedChips.includes(label)} onClick={() => toggleChip(label)}>{label}</Chip>
                  ))}
                </div>
                <p className="section-note">Press either chip to change its state. A check mark means selected.</p>
              </div>
              <div>
                <h3>Switches &amp; motion</h3>
                <Toggle label="Sample switch" checked={sampleSwitch} onChange={setSampleSwitch} />
                <Toggle label="Reduce motion" checked={reduceMotion} onChange={setReduceMotion} />
                <div className="motion-specimen">
                  <svg className="motion-star" viewBox="0 0 60 60" role="img" aria-label="A slowly turning star. It stays still when motion is reduced.">
                    <circle cx="30" cy="30" r="26" />
                    <path d="M30 8l5 17 17 5-17 5-5 17-5-17-17-5 17-5z" />
                  </svg>
                  <p className="section-note">A slow turn, or a still star.<br />Your device’s motion preference is always respected.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="sheet-section" aria-labelledby="pieces-heading">
            <div className="section-heading"><span className="section-number">IV</span><h2 id="pieces-heading">Notes &amp; markers</h2></div>
            <div className="specimen-stack">
              <div><h3>Speech box</h3><p className="sample-note">A line from Glaux</p><SpeechBox>“One little piece at a time. The sky will wait.”</SpeechBox></div>
              <div>
                <h3>Quest rows</h3>
                <p className="sample-note">Display specimens only</p>
                <div className="quest-stack">
                  <QuestRow kind="Learn" title="One small idea" xp={20} done />
                  <QuestRow kind="Discover" title="A tale among the stars" xp={15} />
                </div>
              </div>
              <div>
                <h3>Progress segments</h3>
                <div className="progress-stack">
                  <ProgressSegments label="Empty" filled={0} />
                  <ProgressSegments label="Partly filled" filled={3} />
                  <ProgressSegments label="Complete" filled={6} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="sheet-footer"><span className="eyebrow">ASTRON · Design study</span><p>No lessons yet. Just the beginnings of an atlas.</p></footer>
    </Page>
  );
}
