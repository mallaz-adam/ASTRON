import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Chapter } from '../../data/types';
import type { IllustratedTaleData, StoryArtwork } from '../../data/taleExperience';
import { Button } from '../../design/Button';
import { DiscoveryDetails } from '../../design/DiscoveryDetails';
import { ReadingText, TaleGlaux } from './TaleCommon';
import './IllustratedTale.css';

export function StoryArtworkFigure({ artwork, priority = false, detail = false }: { artwork: StoryArtwork; priority?: boolean; detail?: boolean }) {
  const painting = artwork.src.endsWith('vedder-1280.webp');
  return <figure className={`story-artwork${detail ? ' story-artwork--detail' : ''}`}>
    <div className="story-image-window"><img src={painting ? '/art/pleiades/vedder-640.webp' : artwork.src}
      srcSet={painting ? '/art/pleiades/vedder-640.webp 640w, /art/pleiades/vedder-1280.webp 1280w' : undefined}
      sizes={painting ? '(min-width: 1000px) 600px, calc(100vw - 48px)' : undefined}
      width={artwork.width} height={artwork.height} alt={artwork.alt}
      loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" /></div>
    <figcaption><p>{artwork.caption}</p><p className="story-art-credit">
      {artwork.source ? <a href={artwork.source} target="_blank" rel="noreferrer">{artwork.credit}</a> : artwork.credit}
      {artwork.source && <>{' · '}{artwork.licenseUrl ? <a href={artwork.licenseUrl} target="_blank" rel="noreferrer">{artwork.license}</a> : artwork.license}</>}
    </p></figcaption>
  </figure>;
}

export function IllustratedChapter({ chapter, data }: { chapter: Chapter; data: IllustratedTaleData }) {
  const scene = data.scenes.find(item => item.number === chapter.number)!;
  const [opening, ...paragraphs] = chapter.text.split(/\n\s*\n/);
  return <section className="illustrated-chapter" aria-labelledby="chapter-title">
    <header className="illustrated-heading"><p className="tale-eyebrow">Scene {chapter.number} of {data.scenes.length}</p><h1 id="chapter-title">{chapter.title}</h1><ReadingText text={opening} /></header>
    <div className="illustrated-picture"><StoryArtworkFigure artwork={scene.artwork} priority /></div>
    <div className="illustrated-copy"><ReadingText text={paragraphs.join('\n\n')} />{chapter.glaux && <TaleGlaux mood="gentle">{chapter.glaux}</TaleGlaux>}</div>
  </section>;
}

export function IllustratedEpilogue({ data, collected }: { data: IllustratedTaleData; collected: boolean }) {
  const [view, setView] = useState<'photograph' | 'pattern'>('photograph');
  const { epilogue } = data;
  return <section className="illustrated-epilogue" aria-labelledby="star-title">
    <header className="illustrated-heading"><p className="tale-eyebrow">From myth to the real sky</p><h1 id="star-title">{epilogue.title}</h1><ReadingText text={epilogue.text} /></header>
    <div className="illustrated-picture">
      <div className="story-picture-controls" aria-label="Choose a sky picture">
        <Button variant="secondary" aria-pressed={view === 'photograph'} aria-controls="story-sky-picture" onClick={() => setView('photograph')}>Photograph</Button>
        <Button variant="secondary" aria-pressed={view === 'pattern'} aria-controls="story-sky-picture" onClick={() => setView('pattern')}>Cluster diagram</Button>
      </div>
      <div id="story-sky-picture"><StoryArtworkFigure artwork={epilogue[view]} detail={view === 'photograph'} priority /></div>
      <p className="story-picture-status" role="status">{view === 'photograph' ? 'Astronomical photograph' : 'Illustrated pattern, not a sky-finding chart'}</p>
    </div>
    <div className="illustrated-copy">
      <div className="story-star-note"><h2>{data.starName}</h2><p>{data.fact}</p>{collected && <p className="tale-collected">Added to My sky</p>}<TaleGlaux mood="gentle">{data.starLine}</TaleGlaux></div>
      <p className="tale-picture-note">{epilogue.observingNote}</p>
      {epilogue.discoveries.map(detail => <DiscoveryDetails key={detail.id} className="tale-discovery story-extra" detailId={`tale:${data.taleId}:${detail.id}`} label={detail.label}><ReadingText text={detail.text} /></DiscoveryDetails>)}
    </div>
  </section>;
}

export function IllustratedEnding({ data }: { data: IllustratedTaleData }) {
  return <section className="story-ending" aria-labelledby="star-title">
    <p className="tale-eyebrow">Added to My sky</p><h1 id="star-title">{data.starName}</h1>
    <img src="/art/star.svg" width="72" height="72" alt="" />
    <p>{data.fact}</p><TaleGlaux mood="proud">{data.endingLine}</TaleGlaux>
    <div className="tale-next-question"><p className="tale-eyebrow">A question for later</p><p>{data.endingQuestion}</p></div>
    <Link to="/stories" className="story-return">Back to stories</Link>
  </section>;
}
