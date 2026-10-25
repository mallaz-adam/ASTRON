import { Link } from 'react-router-dom';
import { Page } from '../design/Page';
import { readableTales } from '../logic/taleJourney';
import { localLearnerId } from '../data/learner';
import { useToday } from './useToday';
import { TodayTabs } from './TodayTabs';
import { CoverImage, TaleHeader, TaleGlaux } from './tales/TaleCommon';
import './tales/TaleExperience.css';
import './AtlasReaders.css';

export function Stories() {
  const { content, progress, model, error } = useToday();
  return <Page className="tale-page" reduceMotion={model?.reduceMotion} skipLabel="Skip to stories"><main id="main-content" className="atlas-library" tabIndex={-1} aria-busy={!content && !error}>
    <TaleHeader context="Stories" /><header className="library-heading"><p className="tale-eyebrow">The stories behind the stars</p><h1>Greek stories</h1></header>
    <TaleGlaux mood="gentle">People gave the lights a story. Look for what remains.</TaleGlaux>
    {content && readableTales(content).map(tale => {
      const done = progress?.completions.some(completion => completion.learnerId === localLearnerId && content.cells.some(cell => cell.kind === 'tale' && cell.id === completion.cellId && cell.taleId === tale.id));
      const resume = progress?.learners.find(row => row.id === localLearnerId)?.taleVisit;
      const inProgress = resume?.taleId === tale.id && !['sky', 'preferences'].includes(resume.stage);
      return <article className="library-story" key={tale.id}><CoverImage /><div><p className="tale-eyebrow">{tale.subtitle}</p><h2>{tale.title}</h2><p>{tale.teaser}</p><Link className="atlas-button atlas-button--primary" to={`/stories/${tale.id}${done && !inProgress ? '?again' : ''}`}>{inProgress ? 'Continue the story' : done ? 'Read again' : 'Begin the story'}</Link></div></article>;
    })}
    {error && <p role="alert">{error}</p>}<TodayTabs />
  </main></Page>;
}
