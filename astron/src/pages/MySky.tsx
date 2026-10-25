import { Link } from 'react-router-dom';
import { Page } from '../design/Page';
import { localLearnerId } from '../data/learner';
import { useToday } from './useToday';
import { TodayTabs } from './TodayTabs';
import { TaleHeader, TaleGlaux } from './tales/TaleCommon';
import './tales/TaleExperience.css';
import './AtlasReaders.css';

export function MySky() {
  const { content, progress, model, error } = useToday();
  const stars = progress?.litStars.filter(row => row.learnerId === localLearnerId) ?? [];
  return <Page className="tale-page" reduceMotion={model?.reduceMotion} skipLabel="Skip to My sky"><main id="main-content" className="atlas-library" tabIndex={-1} aria-busy={!content && !error}>
    <TaleHeader context="My sky" /><header className="library-heading"><p className="tale-eyebrow">An atlas of your discoveries</p><h1>My sky</h1></header>
    <TaleGlaux mood="proud">You can return to your stories and lessons here.</TaleGlaux>
    {!stars.length && <p>Your first story can light a star here. <Link to="/stories">Explore the stories.</Link></p>}
    <div className="sky-collection">{stars.map(saved => {
      const star = content?.stars.find(row => row.id === saved.starId);
      if (!star) return null;
      const tale = content?.tales.find(row => row.starId === star.id && row.reader);
      return <article className="sky-entry" key={star.id}><img src="/art/star.svg" width="48" height="48" alt="" /><div><h2>{star.name}</h2><p>{star.factText}</p>
        {saved.tint && <p className="sky-tint">Your hunch: {saved.tint}</p>}
        {tale && <Link to={`/stories/${tale.id}?again`}>Revisit {tale.title}</Link>}
        {star.id === 'betelgeuse' && <Link to="/articles/betelgeuse-colour">Why does Betelgeuse look red?</Link>}
        {saved.how === 'lesson' && <Link to="/cell/star-lesson">Revisit Why stars differ</Link>}
      </div></article>;
    })}</div>
    {error && <p role="alert">{error}</p>}<TodayTabs />
  </main></Page>;
}
