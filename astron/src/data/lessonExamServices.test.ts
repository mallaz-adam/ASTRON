import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AstronDb } from './db';
import { sampleContent } from './contentFixtures';
import { finishReadingLesson } from './lessonServices';
import { readProgress } from './services';

const content = sampleContent();
const lesson = content.lessons.find(item => item.id === 'patterns')!;
const now = new Date('2026-10-28T12:00:00Z');
let database: AstronDb;
let sequence = 0;
beforeEach(() => { database = new AstronDb(`astron-reading-test-${sequence++}`); });
afterEach(async () => { vi.restoreAllMocks(); await database.delete(); });

describe('Individual lesson completion without an exam', () => {
  it('finishes without any submitted answers and awards only the existing Learn quest', async () => {
    expect(await finishReadingLesson(database, content, 'one', lesson.id, now)).toEqual({ learnQuestEarned: true });
    const progress = await readProgress(database);
    expect(progress.answers).toEqual([]);
    expect(progress.completions).toMatchObject([{ cellId: 'orion-lesson', correctAnswers: 0, xpEarned: 0 }]);
    expect(progress.questDone).toMatchObject([{ questId: 'daily-learn', xpEarned: 20 }]);
    expect(progress.litStars).toEqual([]);
  });
  it('keeps simultaneous and repeated finish actions from duplicating rewards', async () => {
    await Promise.all([finishReadingLesson(database, content, 'one', lesson.id, now), finishReadingLesson(database, content, 'one', lesson.id, now)]);
    const before = await readProgress(database);
    expect(await finishReadingLesson(database, content, 'one', lesson.id, new Date('2026-10-29T12:00:00Z'))).toEqual({ learnQuestEarned: false });
    expect(await readProgress(database)).toEqual(before);
  });
  it('preserves an older saved completion instead of deleting its score or answers', async () => {
    await finishReadingLesson(database, content, 'one', lesson.id, now);
    await database.completions.update(['one', lesson.cellId], { correctAnswers: 8 });
    await database.answers.put({ learnerId: 'one', exerciseId: 'ex-01-double', answeredOn: now.toISOString(), correct: true, attempts: 1 });
    const before = await readProgress(database);
    await finishReadingLesson(database, content, 'one', lesson.id, now);
    expect(await readProgress(database)).toEqual(before);
  });
  it('rejects an unknown lesson or another player without completing anything extra', async () => {
    await expect(finishReadingLesson(database, content, 'one', 'missing', now)).rejects.toThrow('not available');
    await finishReadingLesson(database, content, 'one', lesson.id, now);
    await expect(finishReadingLesson(database, content, 'one', 'lesson-03', now)).rejects.toThrow('different reader');
    expect(await database.completions.count()).toBe(1);
  });
  it('rolls back the day, completion and reward if storage fails', async () => {
    vi.spyOn(database.completions, 'add').mockRejectedValueOnce(new Error('Storage full'));
    await expect(finishReadingLesson(database, content, 'one', lesson.id, now)).rejects.toThrow('Storage full');
    for (const rows of Object.values(await readProgress(database))) expect(rows).toEqual([]);
  });
});
