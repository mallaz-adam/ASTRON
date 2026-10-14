import 'fake-indexeddb/auto';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Subscription } from 'dexie';
import { AstronDb } from './db';
import { sampleContent } from './contentFixtures';
import { localLearnerId } from './learner';
import { observeProgress } from './observeProgress';
import { completeCell, eraseProgress, openDay, readProgress, setReduceMotion } from './services';
import type { Progress } from './types';
import { atLocalNoon } from '../logic/dates';
import { buildTodayModel } from '../logic/today';

let database: AstronDb;
let subscription: Subscription | undefined;
let sequence = 0;
const now = atLocalNoon('2026-10-13');
const content = sampleContent();
beforeEach(() => { database = new AstronDb(`astron-observer-test-${sequence++}`); });
afterEach(async () => { subscription?.unsubscribe(); subscription = undefined; await database.delete(); });

it('updates Today’s model when a service changes progress in another database connection', async () => {
  let saved: Progress | undefined;
  await openDay(database, localLearnerId, now);
  subscription = observeProgress(database).subscribe(value => { saved = value; });
  await vi.waitFor(() => expect(saved).toBeDefined());
  const otherConnection = new AstronDb(database.name);
  try {
    await completeCell(otherConnection, content, localLearnerId, 'orion-lesson', now);
    await vi.waitFor(() => expect(buildTodayModel(saved!, content, now).sunStage).toBe(1));
  } finally { otherConnection.close(); }
});

it('saves motion across reads without refilling freezes or rewriting the goal', async () => {
  await openDay(database, localLearnerId, now);
  await database.learners.update(localLearnerId, { freezesLeft: 0, dailyGoal: 3 });
  await setReduceMotion(database, localLearnerId, true);
  database.close(); await database.open();
  const saved = await readProgress(database);
  expect(saved.learners[0]).toMatchObject({ reduceMotion: true, freezesLeft: 0, dailyGoal: 3 });
  await setReduceMotion(database, localLearnerId, false);
  expect((await readProgress(database)).learners[0].freezesLeft).toBe(0);
});

it('notices erased progress and initializes new motion settings with one freeze', async () => {
  let saved: Progress | undefined;
  await setReduceMotion(database, localLearnerId, true);
  subscription = observeProgress(database).subscribe(value => { saved = value; });
  await vi.waitFor(() => expect(saved?.learners[0]?.freezesLeft).toBe(1));
  await eraseProgress(database);
  await vi.waitFor(() => expect(saved?.learners).toEqual([]));
});
