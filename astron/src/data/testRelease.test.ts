import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AstronDb } from './db';
import { sampleContent } from './contentFixtures';
import { localLearnerId } from './learner';
import { readProgress } from './services';
import { finishLesson, saveLessonAnswer, finishReadingLesson } from './lessonServices';
import { buildCoursePath } from '../logic/coursePath';
import { buildTodayModel } from '../logic/today';
import { totalXp } from '../logic/xp';

const content = sampleContent();
const now = new Date('2026-10-24T12:00:00');
let database: AstronDb; let number = 0;
beforeEach(() => { database = new AstronDb(`astron-web-test-${number++}`); vi.stubEnv('PROD', true); });
afterEach(async () => { vi.unstubAllEnvs(); await database.delete(); });

describe('The growing authored course', () => {
  it('offers the real lesson and authored Orion tale online and retains the full course model for tools', () => {
    const online = buildCoursePath(content, { completions: [] });
    expect(online.cells.map(cell => cell.id)).toEqual(['orion-lesson', 'star-lesson', 'orion-tale']);
    expect(online.current?.state).toBe('current');
    expect(online.countText).toBe('0 of 3 available steps done');
    expect(buildCoursePath(content, { completions: [] }, undefined, undefined, false).cells).toHaveLength(11);
  });
  it('opens lesson three after reading the scale lesson without requiring an individual exam or inventing lesson two', async () => {
    const scale=content.lessons.find(l=>l.id==='patterns')!;
    await finishReadingLesson(database,content,localLearnerId,scale.id,now);
    for (const id of ['ex-03-order', 'ex-03-choice']) await saveLessonAnswer(database, content, localLearnerId, 'lesson-03', id, true, now);
    await finishLesson(database, content, localLearnerId, 'lesson-03', [], now, 'blue');
    const progress = await readProgress(database);
    expect(progress.completions.map(row => row.cellId).sort()).toEqual(['orion-lesson','star-lesson']);
    expect(totalXp(progress.completions, progress.questDone, progress.answers, content.exercises)).toBe(40);
    expect(progress.litStars).toHaveLength(1);
    expect(buildTodayModel(progress, content, now).currentCellTitle).toBe('Orion');
  });
});
