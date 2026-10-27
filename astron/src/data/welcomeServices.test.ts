import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AstronDb } from './db';
import { defaultLearner } from './learner';
import { acknowledgeIntroduction } from './welcomeServices';
import { readProgress } from './services';
import { needsIntroduction, needsWelcome } from '../logic/taleJourney';

let database: AstronDb; let sequence = 0;
const now = new Date('2026-10-26T12:00:00Z');
beforeEach(() => { database = new AstronDb(`astron-welcome-${sequence++}`); });
afterEach(async () => { await database.delete(); });
describe('The short first-visit introduction', () => {
  it('introduces a fresh learner, then remembers the introduction without awarding learning progress', async () => {
    expect(needsIntroduction(await readProgress(database), 'one')).toBe(true);
    await acknowledgeIntroduction(database, 'one', now);
    const saved = await readProgress(database);
    expect(needsIntroduction(saved, 'one')).toBe(false);
    expect(needsWelcome(saved, 'one')).toBe(true);
    expect(saved.learners[0].welcome?.completedOn).toBeUndefined();
    expect(saved.learners[0].taleVisit).toBeUndefined();
    for (const [name, rows] of Object.entries(saved)) if (name !== 'learners') expect(rows).toEqual([]);
    database.close(); await database.open();
    expect(needsIntroduction(await readProgress(database), 'one')).toBe(false);
  });
  it('does not interrupt an older unfinished story or a returning learner', async () => {
    await database.learners.put({ ...defaultLearner('one'), welcome: { startedOn: now.toISOString() }, taleVisit: { taleId: 'orion-shoulder', stage: 'story', chapter: 2, readThrough: false } });
    expect(needsIntroduction(await readProgress(database), 'one')).toBe(false);
    await database.learners.update('one', { welcome: { startedOn: now.toISOString(), completedOn: now.toISOString() } });
    expect(needsIntroduction(await readProgress(database), 'one')).toBe(false);
  });
  it('is idempotent and preserves preferences and existing discovery cues', async () => {
    await database.learners.put({ ...defaultLearner('one'), reduceMotion: true, freezesLeft: 0, exploredDetails: ['detail-one'] });
    await acknowledgeIntroduction(database, 'one', now);
    await acknowledgeIntroduction(database, 'one', new Date('2026-10-27T12:00:00Z'));
    expect(await database.learners.get('one')).toMatchObject({ reduceMotion: true, freezesLeft: 0, exploredDetails: ['detail-one'], welcome: { introductionSeenOn: now.toISOString() } });
  });
});
