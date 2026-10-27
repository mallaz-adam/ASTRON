import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AstronDb } from './db';
import { defaultLearner } from './learner';
import { prepareProgress } from './prepareProgress';
import { previewDatabaseName } from './progressMode';
import { readProgress } from './services';
import { sampleContent } from './contentFixtures';
import { advanceTaleVisit, startTaleVisit } from './taleServices';

let preview: AstronDb;
let permanent: AstronDb;
beforeEach(() => {
  preview = new AstronDb(previewDatabaseName);
  permanent = new AstronDb('astron-preserved-progress-test');
});
afterEach(async () => { await preview.delete(); await permanent.delete(); });

describe('Temporary development visits', () => {
  it('clears every temporary progress table at the next opening without touching earlier saved progress', async () => {
    const learner = { ...defaultLearner('one'), freezesLeft: 0, reduceMotion: true };
    await permanent.learners.put(learner);
    await preview.learners.put(learner);
    await preview.learnerInterests.put({ learnerId: 'one', interestId: 'stars' });
    await preview.activityDays.put({ learnerId: 'one', dayDate: '2026-10-27', dailyGoal: 2, freezeUsed: false });
    await preview.questDone.put({ learnerId: 'one', dayDate: '2026-10-27', questId: 'daily-learn', doneOn: '2026-10-27', xpEarned: 20 });
    await preview.completions.put({ learnerId: 'one', cellId: 'star-lesson', completedOn: '2026-10-27', correctAnswers: 2, xpEarned: 0 });
    await preview.answers.put({ learnerId: 'one', exerciseId: 'colour', answeredOn: '2026-10-27', correct: true, attempts: 1 });
    await preview.litStars.put({ learnerId: 'one', starId: 'star-clue-03', litOn: '2026-10-27', how: 'lesson', tint: 'blue' });
    await preview.articleReads.put({ learnerId: 'one', articleId: 'betelgeuse-colour', readOn: '2026-10-27' });
    await prepareProgress(preview, true);
    for (const rows of Object.values(await readProgress(preview))) expect(rows).toEqual([]);
    expect(await permanent.learners.get('one')).toEqual(learner);
  });

  it('lets normal services keep the journey moving during one visit, then starts fresh on another', async () => {
    await prepareProgress(preview, true);
    const content = sampleContent();
    await startTaleVisit(preview, content, 'one', 'orion-shoulder', new Date('2026-10-27T12:00:00Z'), { welcome: true });
    await advanceTaleVisit(preview, content, 'one', 'orion-shoulder');
    expect((await readProgress(preview)).learners[0].taleVisit?.chapter).toBe(2);
    preview.close(); await preview.open();
    await prepareProgress(preview, true);
    expect((await readProgress(preview)).learners).toEqual([]);
  });

  it('never clears the permanent database, even if temporary mode is passed by mistake', async () => {
    await permanent.learners.put(defaultLearner('one'));
    await expect(prepareProgress(permanent, true)).rejects.toThrow('own preview database');
    expect(await permanent.learners.count()).toBe(1);
  });

  it('retains progress when permanent saving is enabled for a future release', async () => {
    await permanent.learners.put(defaultLearner('one'));
    await prepareProgress(permanent, false);
    expect(await permanent.learners.count()).toBe(1);
  });
});
