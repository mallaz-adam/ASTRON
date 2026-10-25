import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Page } from '../design/Page';
import { Button } from '../design/Button';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { markArticleRead } from '../data/services';
import { localDate } from '../logic/dates';
import { useToday } from './useToday';
import { TodayTabs } from './TodayTabs';
import { TaleHeader, ReadingText, SourceText } from './tales/TaleCommon';
import { NotFound } from './NotFound';
import './tales/TaleExperience.css';
import './AtlasReaders.css';

export function Articles() {
  const { content, model, error } = useToday();
  return <Page className="tale-page" reduceMotion={model?.reduceMotion} skipLabel="Skip to articles"><main id="main-content" className="atlas-library" tabIndex={-1} aria-busy={!content && !error}>
    <TaleHeader context="Articles" /><header className="library-heading"><p className="tale-eyebrow">Follow a question a little further</p><h1>Scientific articles</h1></header>
    <div className="article-list">{content?.articles.filter(article => article.sourceNote).map(article => <article key={article.id}><p className="tale-eyebrow">Read</p><h2><Link to={`/articles/${article.id}`}>{article.title}</Link></h2><p>{article.summary}</p><Link className="article-open" to={`/articles/${article.id}`}>Read the article</Link></article>)}</div>
    {error && <p role="alert">{error}</p>}<TodayTabs />
  </main></Page>;
}

export function ArticleReader() {
  const { id } = useParams();
  const { content, model, error } = useToday();
  const article = content?.articles.find(row => row.id === id);
  const [savedDay, setSavedDay] = useState('');
  const saved = savedDay === model?.dayDate;
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const writing = useRef(false);
  async function finish() {
    if (!article || !content || writing.current) return;
    writing.current = true; setSaving(true); setSaveError('');
    try { const now = new Date(); await markArticleRead(db, content, localLearnerId, article.id, now); setSavedDay(localDate(now)); }
    catch (problem) { setSaveError(problem instanceof Error ? problem.message : String(problem)); }
    finally { writing.current = false; setSaving(false); }
  }
  if (content && !article) return <NotFound />;
  return <Page className="tale-page" reduceMotion={model?.reduceMotion} skipLabel="Skip to article"><main id="main-content" className="atlas-library" tabIndex={-1} aria-busy={!article && !error}>
    <TaleHeader context="Read" closeTo="/articles" />{article && <article className="article-reading"><p className="tale-eyebrow">Scientific articles</p><h1>{article.title}</h1><p className="article-summary">{article.summary}</p><ReadingText text={article.body} />
      {article.sourceNote && <details className="tale-sources"><summary>Sources</summary><SourceText text={article.sourceNote} /></details>}
      <Button onClick={() => void finish()} disabled={saving || saved}>{saved ? 'Article read' : 'Mark as read'}</Button>{saved && <p role="status">Your reading is saved on this device.</p>}
      <aside className="article-connections"><p className="tale-eyebrow">Keep exploring</p><Link to="/stories/orion-shoulder?again">Meet Orion in the story</Link><Link to="/learn">Explore how stars live and die</Link></aside>
    </article>}{(error || saveError) && <p role="alert">{error || saveError}</p>}
  </main></Page>;
}
