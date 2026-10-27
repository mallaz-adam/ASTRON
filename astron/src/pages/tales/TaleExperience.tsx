import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { db } from '../../data/db';
import { localLearnerId } from '../../data/learner';
import { loadTaleExperience, type TaleExperienceData } from '../../data/taleExperience';
import { advanceTaleVisit, answerBeltActivity, collectTaleStar, finishWelcome, previousTaleChapter, startTaleVisit } from '../../data/taleServices';
import { setReduceMotion } from '../../data/services';
import { firstTaleId, type BeltChoice } from '../../logic/taleJourney';
import { Page } from '../../design/Page';
import { Button } from '../../design/Button';
import { Toggle } from '../../design/Toggle';
import { useReducedMotion } from '../../design/useReducedMotion';
import { temporaryProgress } from '../../data/progressMode';
import { useToday } from '../useToday';
import { NotFound } from '../NotFound';
import { TaleHeader, TaleSources } from './TaleCommon';
import { TaleChapter, TaleCover, TaleStar } from './TaleScenes';
import { BeltActivity } from './BeltActivity';
import { TalePreferences } from './TalePreferences';
import './TaleExperience.css';

export function TaleExperience({ welcome = false }: { welcome?: boolean }) {
  const { id } = useParams();
  const taleId = welcome ? firstTaleId : id;
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const { content, progress, model, error: loadError } = useToday();
  const tale = content?.tales.find(row => row.id === taleId && row.reader);
  const [data, setData] = useState<TaleExperienceData>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const writing = useRef(false);
  const main = useRef<HTMLElement>(null);
  const learner = progress?.learners.find(row => row.id === localLearnerId);
  const visit = learner?.taleVisit && learner.taleVisit.taleId === taleId ? learner.taleVisit : undefined;
  const reduceMotion = useReducedMotion(model?.reduceMotion ?? false);
  const wantsCover = search.has('cover') || search.has('again');
  const showCover = wantsCover || !visit;
  const stage = showCover ? 'cover' : visit.stage;
  const sceneKey = `${taleId}-${stage}-${visit?.chapter ?? 1}`;

  useEffect(() => {
    let active = true;
    setData(undefined);
    if (tale?.reader) void loadTaleExperience(tale.reader).then(value => {
      if (value.taleId !== tale.id) throw new Error('The story content belongs to a different tale.');
      if (active) setData(value);
    }).catch(problem => { if (active) setError(problem instanceof Error ? problem.message : String(problem)); });
    return () => { active = false; };
  }, [tale?.reader, tale?.id]);

  useEffect(() => {
    if (!data) return;
    document.title = `${tale?.title ?? 'Orion'} · ASTRON`;
    const heading = main.current?.querySelector('h1');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [sceneKey, data, tale?.title]);

  // Navigate only after the live query has observed the finished welcome.
  // Otherwise the home guard can briefly see the previous checkpoint and
  // send a successfully saved learner straight back to preferences.
  useEffect(() => {
    if (welcome && learner?.welcome?.completedOn && !wantsCover) navigate('/', { replace: true });
  }, [welcome, learner?.welcome?.completedOn, wantsCover, navigate]);

  async function save(action: () => Promise<unknown>, after?: () => void) {
    if (writing.current) return false;
    writing.current = true; setBusy(true); setError('');
    try { await action(); after?.(); return true; }
    catch (problem) { setError(problem instanceof Error ? problem.message : String(problem)); return false; }
    finally { writing.current = false; setBusy(false); }
  }

  function advance() {
    if (!content || !taleId) return;
    if (stage === 'sky' && !welcome) { navigate('/sky'); return; }
    void save(() => advanceTaleVisit(db, content, localLearnerId, taleId));
  }

  async function answer(choice: BeltChoice | 'show-me') {
    if (!content || !taleId) return undefined;
    let correct = false;
    const saved = await save(async () => { correct = await answerBeltActivity(db, content, localLearnerId, taleId, choice); });
    return saved ? correct : undefined;
  }

  if (content && !tale) return <NotFound />;
  if (!content || !progress || !model || !tale || !data) return <Page className="tale-page" skipLabel="Skip to story"><main id="main-content" className="tale-loading" aria-busy={!(loadError || error)}><h1>Opening the atlas…</h1>{(loadError || error) && <><p role="alert">{loadError || error}</p><Button onClick={() => window.location.reload()}>Try again</Button></>}</main></Page>;

  const chapters = content.chapters.filter(row => row.taleId === taleId).sort((a, b) => a.number - b.number);
  const chapter = chapters.find(row => row.number === visit?.chapter) ?? chapters[0];
  const collected = progress.litStars.some(row => row.learnerId === localLearnerId && row.starId === tale.starId);
  return <Page className={`tale-page ${stage === 'cover' ? 'tale-page--cover' : ''}`} reduceMotion={reduceMotion} skipLabel="Skip to story">
    <main id="main-content" ref={main} className="tale-main" tabIndex={-1} aria-busy={busy}>
      {stage !== 'cover' && <TaleHeader context={stage === 'sky' ? 'My sky' : tale.title} closeTo={welcome ? '/welcome?cover' : '/stories'} />}
      {stage === 'cover' && <TaleCover tale={tale} data={data} busy={busy} resume={Boolean(visit && !search.has('again') && !learner?.welcome?.completedOn)} onBegin={() => void save(() => startTaleVisit(db, content, localLearnerId, tale.id, new Date(), { welcome: welcome && !learner?.welcome?.completedOn, restart: search.has('again') || Boolean(welcome && learner?.welcome?.completedOn) }), () => navigate(welcome && !learner?.welcome?.completedOn ? '/welcome' : `/stories/${tale.id}`, { replace: true }))} />}
      {stage === 'story' && <><TaleChapter key={chapter.number} chapter={chapter} data={data} /><nav className="tale-actions tale-chapter-actions" aria-label="Story chapters">
        {chapter.number > 1 && <Button variant="secondary" disabled={busy} onClick={() => void save(() => previousTaleChapter(db, localLearnerId, tale.id))}>Previous chapter</Button>}
        <p className="tale-chapter-count">{chapter.number} of {chapters.length}</p><Button disabled={busy} onClick={advance}>{chapter.number === chapters.length ? 'Discover your star' : 'Continue'}</Button></nav></>}
      {stage === 'star' && <><TaleStar tale={tale} data={data} collected={collected} /><div className="tale-actions tale-ending-actions"><Button disabled={busy} onClick={() => void save(() => collectTaleStar(db, content, localLearnerId, tale.id, new Date()))}>{collected ? 'Continue' : 'Light this star'}</Button></div></>}
      {stage === 'activity' && <BeltActivity data={data} outcome={visit?.beltOutcome} busy={busy} onAnswer={answer} onContinue={advance} />}
      {stage === 'sky' && <><TaleStar tale={tale} data={data} collected={collected} ending /><div className="tale-actions tale-ending-actions"><Button disabled={busy} onClick={advance}>Continue</Button></div></>}
      {stage === 'preferences' && (welcome ? <TalePreferences interests={content.interests} selected={progress.learnerInterests.filter(row => row.learnerId === localLearnerId).map(row => row.interestId)} dailyGoal={learner!.dailyGoal} reduceMotion={learner!.reduceMotion} busy={busy} onSave={(interests, goal, motion) => void save(() => finishWelcome(db, content, localLearnerId, interests, goal, motion, new Date()))} /> : <section className="tale-preferences"><h1>Your star is in My sky.</h1><Link to="/sky" className="atlas-button atlas-button--primary">My sky</Link></section>)}
      {(error || loadError) && <div className="tale-save-error" role="alert"><p>{error || loadError}</p><p>Your place is still here. Please try the action again.</p></div>}
      <footer className="tale-footer">{stage !== 'cover' && <TaleSources data={data} />}<Toggle label="Reduce motion" checked={learner?.reduceMotion ?? false} onChange={value => void save(() => setReduceMotion(db, localLearnerId, value))} />{temporaryProgress && <a className="article-open" href="/start">Start from the beginning</a>}</footer>
    </main>
  </Page>;
}
