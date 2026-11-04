import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Page } from '../design/Page';
import { Button } from '../design/Button';
import { ActionLink } from '../design/ActionLink';
import { DiscoveryDetails } from '../design/DiscoveryDetails';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import type { Article } from '../data/types';
import { markArticleRead } from '../data/services';
import { localDate } from '../logic/dates';
import { useToday } from './useToday';
import { TodayTabs } from './TodayTabs';
import { TaleHeader, ReadingText, SourceText } from './tales/TaleCommon';
import { NotFound } from './NotFound';
import { ArticleCover } from './ArticleCover';
import { temporaryProgress } from '../data/progressMode';
import './tales/TaleExperience.css';
import './AtlasReaders.css';
import './Articles.css';

export function ArticleCard({ article }: { article: Article }) {
  return <article className="article-card">
    <div className="article-card-content">
      <div className="article-meta"><span className="article-category">{article.category ?? 'Astronomy'}</span><span>{article.readingMin} min read</span></div>
      <h2>{article.title}</h2><p className="article-card-summary">{article.summary}</p>
      <ActionLink variant="primary" to={`/articles/${article.id}`} aria-label={`Read the article: ${article.title}`}>Read the article</ActionLink>
    </div>
    {article.cover && <ArticleCover cover={article.cover} />}
  </article>;
}

export function Articles() {
  const { content, model, error } = useToday();
  return <Page className="tale-page articles-page" reduceMotion={model?.reduceMotion} skipLabel="Skip to articles"><main id="main-content" className="atlas-library" tabIndex={-1} aria-busy={!content && !error}>
    <TaleHeader context="Articles" /><header className="library-heading"><p className="tale-eyebrow">Follow a question a little further</p><h1>Scientific articles</h1><p>Explore the science behind the sky, one question at a time.</p></header>
    <div className="article-list">{content?.articles.filter(article => article.sourceNote).map(article => <ArticleCard key={article.id} article={article} />)}</div>
    {error && <p role="alert">{error}</p>}<TodayTabs />
  </main></Page>;
}

export function ArticleReadingView({ article, saved, saving, onFinish, reduceMotion = false }: { article: Article; saved: boolean; saving: boolean; onFinish: () => void; reduceMotion?: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const navigate = useNavigate();
  const sectionId = (id: string) => `article-${article.id}-${id}`;
  function jump(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    navigate({ hash: `#${id}` }, { preventScrollReset: true });
    target.focus({ preventScroll: true });
    const stopped = reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ block: 'start', behavior: stopped ? 'instant' : 'smooth' });
  }
  useEffect(() => {
    document.title = `${article.title} · ASTRON`;
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [article.id, article.title]);
  return <article className="article-reading" aria-labelledby="article-title">
    <header className="article-toolbar"><ActionLink to="/articles">All articles</ActionLink><Link to="/" className="tale-wordmark" aria-label="ASTRON Today">ASTRON</Link></header>
    <header className="article-introduction">
      <div className="article-meta"><span className="article-category">{article.category ?? 'Astronomy'}</span><span>{article.readingMin} min read</span></div>
      <h1 id="article-title" ref={heading} tabIndex={-1}>{article.title}</h1><p className="article-summary">{article.summary}</p>
    </header>
    {article.cover && <ArticleCover cover={article.cover} priority />}
    <div className="article-reading-layout">
      {article.sections && <nav className="article-outline" aria-label="In this article"><p className="tale-eyebrow">In this article</p><div>{article.sections.map(section => <a key={section.id} className="article-section-link" href={`#${sectionId(section.id)}`} onClick={event => jump(event, sectionId(section.id))}>{section.title}</a>)}</div></nav>}
      <div className="article-reading-body">
        {article.sections ? article.sections.map(section => <section className="article-section" key={section.id} aria-labelledby={sectionId(section.id)}><h2 id={sectionId(section.id)} tabIndex={-1}>{section.title}</h2><ReadingText text={section.text} /></section>) : <ReadingText text={article.body} />}
        <section className="article-finish" aria-label="Finish reading"><Button onClick={onFinish} disabled={saving || saved}>{saving ? 'Saving…' : saved ? 'Article read' : 'Mark as read'}</Button>
          {saved && <p role="status">{temporaryProgress ? 'Article read for this visit.' : 'Your reading is saved on this device.'}</p>}
        </section>
        <aside className="article-connections" aria-label="Keep exploring"><p className="tale-eyebrow">Keep exploring</p><ActionLink to="/stories/orion-shoulder?again">Meet Orion in the story</ActionLink><ActionLink to="/learn?chapter=first-sky">Explore how stars live and die</ActionLink></aside>
        {article.sourceNote && <DiscoveryDetails emphasis="quiet" className="tale-sources" detailId={`article:${article.id}:sources`} label="Sources"><SourceText text={article.sourceNote} /></DiscoveryDetails>}
        <div className="article-return-actions"><ActionLink to="/articles">All articles</ActionLink><a className="atlas-button atlas-button--secondary atlas-action-link article-back-top" href="#article-title" onClick={event => jump(event, 'article-title')}>Back to top</a></div>
      </div>
    </div>
  </article>;
}

export function ArticleReader() {
  const { id } = useParams();
  const { content, model, progress, error } = useToday();
  const article = content?.articles.find(row => row.id === id);
  const [savedKey, setSavedKey] = useState('');
  const readKey = `${id}:${model?.dayDate}`;
  const saved = savedKey === readKey || Boolean(model && progress?.articleReads.some(read => read.learnerId === localLearnerId && read.articleId === id && localDate(new Date(read.readOn)) === model.dayDate));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const writing = useRef(false);
  async function finish() {
    if (!article || !content || writing.current) return;
    writing.current = true; setSaving(true); setSaveError('');
    try { const now = new Date(); await markArticleRead(db, content, localLearnerId, article.id, now); setSavedKey(`${article.id}:${localDate(now)}`); }
    catch (problem) { setSaveError(problem instanceof Error ? problem.message : String(problem)); }
    finally { writing.current = false; setSaving(false); }
  }
  if (content && !article) return <NotFound />;
  return <Page className="tale-page article-reading-page" reduceMotion={model?.reduceMotion} skipLabel="Skip to article"><main id="main-content" className="atlas-library" tabIndex={-1} aria-busy={!article && !error}>
    {article && <ArticleReadingView article={article} saved={saved} saving={saving} reduceMotion={model?.reduceMotion} onFinish={() => void finish()} />}
    {(error || saveError) && <p role="alert">{error || saveError}</p>}<TodayTabs />
  </main></Page>;
}
