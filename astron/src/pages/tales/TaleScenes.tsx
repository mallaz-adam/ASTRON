import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Chapter, Tale } from '../../data/types';
import type { TaleExperienceData, OrionTaleData } from '../../data/taleExperience';
import { Button } from '../../design/Button';
import { DiscoveryDetails } from '../../design/DiscoveryDetails';
import { CoverImage, ReadingText, TaleGlaux, TaleSources } from './TaleCommon';
import { OrionChart } from './OrionChart';
import { StoryArtworkFigure } from './IllustratedTale';

export function TaleCover({ tale, data, resume, busy, onBegin }: { tale: Tale; data: TaleExperienceData; resume: boolean; busy: boolean; onBegin: () => void }) {
  return <section className="tale-cover" aria-labelledby="tale-title">
    <Link to="/" className="tale-wordmark cover-wordmark">ASTRON<img src="/art/star.svg" width="20" height="20" alt="" /></Link>
    <div className="cover-heading"><p className="tale-eyebrow">{tale.subtitle}</p><h1 id="tale-title">{tale.title}</h1></div>
    <div className={`cover-art ${data.kind === 'illustrated' ? 'cover-art--historical' : ''}`}>{data.kind === 'illustrated' ? <StoryArtworkFigure artwork={data.cover} priority /> : <CoverImage priority />}</div>
    <div className="cover-invitation"><p className="cover-teaser">{tale.teaser}</p>
      <Button onClick={onBegin} disabled={busy}>{resume ? 'Resume the story' : 'Begin the story'}</Button>
      <TaleGlaux mood="gentle">{data.welcomeLine}</TaleGlaux>
      <TaleSources data={data} />
    </div>
  </section>;
}

function HunterImage() {
  return <img className="tale-hunter-image" src="/art/orion/hunter.webp" width="403" height="530" decoding="async" alt="The supplied illustration of Orion, raising a club and holding an animal skin, with a pattern of stars." />;
}

export function TaleChapter({ chapter, data }: { chapter: Chapter; data: OrionTaleData }) {
  const [hunterVisible, setHunterVisible] = useState(true);
  const [feature, setFeature] = useState<'belt' | 'star'>('belt');
  const type = chapter.presentation;
  const [opening, ...paragraphs] = chapter.text.split(/\n\s*\n/);
  return <section className={`tale-chapter tale-chapter--${type}`} aria-labelledby="chapter-title">
    <div className="tale-chapter-heading"><p className="tale-eyebrow">Chapter {['I', 'II', 'III', 'IV'][chapter.number - 1]}</p><h1 id="chapter-title">{chapter.title}</h1><ReadingText text={opening} /></div>
    <aside className="tale-illustration" aria-label="Explore the illustration">
      {type === 'hunter' && <><figure className="tale-plate"><HunterImage /><figcaption>The hunter, imagined</figcaption></figure>
        <DiscoveryDetails className="tale-discovery" detailId={`tale:${chapter.taleId}:chapter:${chapter.number}:extra`} label="A pattern to remember"><p>{chapter.marginNotes[0]}</p><OrionChart data={data} highlight="belt" /></DiscoveryDetails></>}
      {type === 'landscape' && <><figure className="tale-plate"><img className="tale-scorpion-image" src="/art/orion/scorpion.svg" width="360" height="300" alt="An imagined scorpion with two claws and a curved tail, on stony ground." /><figcaption>The scorpion, imagined</figcaption></figure><DiscoveryDetails className="tale-discovery" detailId={`tale:${chapter.taleId}:chapter:${chapter.number}:extra`} label="Another telling"><p>{chapter.marginNotes[0]}</p></DiscoveryDetails></>}
      {type === 'chart' && <><div className="tale-exploration-controls"><p>Switch between the imagined hunter and the star chart.</p><Button variant="secondary" aria-pressed={!hunterVisible} onClick={() => setHunterVisible(!hunterVisible)}>{hunterVisible ? 'Show the star chart' : 'Show the hunter'}</Button><p className="tale-picture-note" role="status">{hunterVisible ? 'The hunter is an imagined figure.' : 'The chart shows where the real stars appear.'}</p></div><figure className="tale-plate">{hunterVisible ? <HunterImage /> : <OrionChart data={data} labels />}
        <figcaption aria-live="polite">{hunterVisible ? 'The hunter, imagined' : 'Orion, seen from Earth'}</figcaption></figure>
        <p className="tale-picture-note">{chapter.marginNotes[0]}</p></>}
      {type === 'guided-chart' && <><div className="tale-exploration-controls"><p>Choose the belt or Betelgeuse to highlight it on the chart.</p><div className="tale-feature-controls" role="group" aria-label="Look more closely"><Button variant="secondary" aria-pressed={feature === 'belt'} onClick={() => setFeature('belt')}>Orion's belt</Button><Button variant="secondary" aria-pressed={feature === 'star'} onClick={() => setFeature('star')}>Betelgeuse</Button></div>
        <p className="tale-picture-note" role="status" aria-live="polite" aria-atomic="true">{feature === 'belt' ? "Three close stars form Orion's belt." : data.fact}</p></div><figure className="tale-plate"><OrionChart data={data} highlight={feature} labels /><figcaption>Orion, seen from Earth</figcaption></figure></>}
    </aside>
    <div className="tale-chapter-copy">{paragraphs.length > 0 && <ReadingText text={paragraphs.join('\n\n')} />}{chapter.glaux && <TaleGlaux>{chapter.glaux}</TaleGlaux>}</div>
  </section>;
}

export function TaleStar({ tale, data, collected, ending = false }: { tale: Tale; data: OrionTaleData; collected: boolean; ending?: boolean }) {
  return <section className="tale-star-scene" aria-labelledby="star-title">
    <div className="tale-star-heading"><p className="tale-eyebrow">{ending ? 'Your sky has begun' : "The story's star"}</p><h1 id="star-title">Betelgeuse</h1>{collected && <p className="tale-collected">Added to My sky</p>}<p>{data.fact}</p></div>
    <figure className="tale-plate tale-star-plate"><OrionChart data={data} highlight="star" labels /><figcaption>Orion, seen from Earth</figcaption></figure>
    <div className="tale-star-copy">
      <TaleGlaux mood={ending ? 'proud' : 'gentle'}>{ending ? data.endingLine : data.starLine}</TaleGlaux>
      {ending && <div className="tale-next-question"><p className="tale-eyebrow">A question for later</p><p>{data.endingQuestion}</p></div>}
      <p className="tale-origin">From {tale.title}</p>
    </div>
  </section>;
}
