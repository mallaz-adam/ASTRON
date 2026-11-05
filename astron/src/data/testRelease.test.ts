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
    const online = buildCoursePath(content, { completions: [] }, undefined, 'first-sky');
    expect(online.cells.map(cell => cell.id)).toEqual(['orion-lesson', 'star-lesson', 'orion-tale', 'pleiades-tale']);
    expect(online.current?.state).toBe('current');
    expect(online.countText).toBe('0 of 4 available steps done');
    expect(buildCoursePath(content, { completions: [] }, undefined, 'first-sky', false).cells).toHaveLength(11);
  });
  it('starts in the beginner chapter and rejects a later chapter without writing rewards or answers', async () => {
    await expect(finishReadingLesson(database, content, localLearnerId, 'patterns', now)).rejects.toThrow('Complete the evaluation in Our place in space');
    await expect(saveLessonAnswer(database, content, localLearnerId, 'lesson-03', 'ex-03-choice', true, now)).rejects.toThrow('Complete the evaluation');
    await expect(finishLesson(database, content, localLearnerId, 'lesson-03', [], now, 'blue')).rejects.toThrow('Complete the evaluation');
    const progress = await readProgress(database);
    expect(progress.completions).toEqual([]);
    expect(progress.answers).toEqual([]);
    expect(totalXp(progress.completions, progress.questDone, progress.answers, content.exercises)).toBe(0);
    expect(progress.litStars).toHaveLength(0);
    expect(buildTodayModel(progress, content, now).currentCellTitle).toBe('Earth, the Sun and the Moon');
  });
});
