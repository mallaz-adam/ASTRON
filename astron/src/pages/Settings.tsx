import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../design/Page';
import { Toggle } from '../design/Toggle';
import { db } from '../data/db';
import { localLearnerId } from '../data/learner';
import { changeDailyGoal, setReduceMotion } from '../data/services';
import type { DailyGoal } from '../data/types';
import { useToday } from './useToday';
import { TaleHeader } from './tales/TaleCommon';
import { TestTools } from './TestTools';
import './tales/TaleExperience.css';
import './AtlasReaders.css';

export function Settings() {
  const { model, error } = useToday();
  const [saveError, setSaveError] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(action: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true); setSaveError('');
    try { await action(); } catch (problem) { setSaveError(problem instanceof Error ? problem.message : String(problem)); }
    finally { setBusy(false); }
  }
  return <Page className="tale-page" reduceMotion={model?.reduceMotion} skipLabel="Skip to preferences"><main id="main-content" className="atlas-library settings-page" tabIndex={-1}>
    <TaleHeader context="Your preferences" closeTo="/" /><h1>Your preferences</h1>{model && <>
      <fieldset className="daily-goal-choices" disabled={busy}><legend>Daily goal</legend>{([{ value: 1, label: 'Light — 1 quest' }, { value: 2, label: 'Steady — 2 quests' }, { value: 3, label: 'Full — 3 quests' }] as const).map(option => <label className="daily-goal-choice" key={option.value}><input type="radio" name="goal" checked={model.dailyGoal === option.value} onChange={() => void save(() => changeDailyGoal(db, localLearnerId, option.value as DailyGoal, new Date()))} /><span>{option.label}</span></label>)}</fieldset>
      <Toggle label="Reduce motion" checked={model.reduceMotion} onChange={value => void save(() => setReduceMotion(db, localLearnerId, value))} /><p>Progress stays on this device.</p><Link className="article-open" to="/guide">How ASTRON works</Link><TestTools />
    </>}{(error || saveError) && <p role="alert">{error || saveError}</p>}
  </main></Page>;
}
