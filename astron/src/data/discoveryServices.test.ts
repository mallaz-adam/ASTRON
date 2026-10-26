import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AstronDb } from './db';
import { defaultLearner } from './learner';
import { markDetailExplored } from './discoveryServices';
import { eraseProgress, exportProgress, readProgress } from './services';

let database: AstronDb;
let sequence = 0;
beforeEach(() => { database = new AstronDb(`astron-discovery-${sequence++}`); });
afterEach(async () => { await database.delete(); });

describe('Opened optional details', () => {
  it('adds the optional preference to an older learner without changing their settings or journey', async () => {
    const learner = { ...defaultLearner('one'), dailyGoal: 3 as const, reduceMotion: true, freezesLeft: 0,
      taleVisit: { taleId: 'orion-shoulder', stage: 'story' as const, chapter: 2, readThrough: false } };
    await database.learners.add(learner);
    await markDetailExplored(database, 'one', 'tale:orion-shoulder:chapter:2:extra');
    expect(await database.learners.get('one')).toEqual({ ...learner, exploredDetails: ['tale:orion-shoulder:chapter:2:extra'] });
    const progress = await readProgress(database);
    for (const [table, rows] of Object.entries(progress)) if (table !== 'learners') expect(rows).toEqual([]);
  });
  it('remembers different details once, even with concurrent opening events', async () => {
    await Promise.all(['one-detail', 'another-detail', 'one-detail'].map(id => markDetailExplored(database, 'one', id)));
    expect((await database.learners.get('one'))?.exploredDetails?.sort()).toEqual(['another-detail', 'one-detail']);
    database.close(); await database.open();
    expect((await database.learners.get('one'))?.exploredDetails).toHaveLength(2);
  });
  it('includes the preference in the existing export and removes it when progress is erased', async () => {
    await markDetailExplored(database, 'one', 'tale:orion-shoulder:sources');
    expect(JSON.parse(await exportProgress(database)).learners[0].exploredDetails).toEqual(['tale:orion-shoulder:sources']);
    await eraseProgress(database);
    expect(await database.learners.count()).toBe(0);
  });
  it('rejects blank or unbounded IDs before writing any progress', async () => {
    await expect(markDetailExplored(database, 'one', '  ')).rejects.toThrow('stable ID');
    await expect(markDetailExplored(database, 'one', 'a'.repeat(201))).rejects.toThrow('stable ID');
    expect(await database.learners.count()).toBe(0);
  });
});
