import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AstronDb } from './db';
import { sampleContent } from './contentFixtures';
import { submitLessonExam } from './lessonServices';
import { correctSelection } from '../logic/lessonPlayer';
import { readProgress } from './services';

const content=sampleContent();
const lesson=content.lessons.find(l=>l.id==='patterns')!;
const now=new Date('2026-10-27T12:00:00Z');
const answers=()=>Object.fromEntries(lesson.cards.flatMap(c=>c.kind==='exercise'?[[c.exerciseId,correctSelection(content.exercises.find(e=>e.id===c.exerciseId)!)]]:[]));
let db:AstronDb;let sequence=0;
beforeEach(()=>{db=new AstronDb(`astron-exam-test-${sequence++}`);});
afterEach(async()=>{vi.restoreAllMocks();await db.delete();});

describe('A complete ending exam',()=>{
  it('awards only the existing Learn quest after a complete submission',async()=>{
    const result=await submitLessonExam(db,content,'one',lesson.id,answers(),now);
    expect(result).toMatchObject({correct:8,total:8,learnQuestEarned:true});
    const p=await readProgress(db);
    expect(p.answers).toHaveLength(8);
    expect(p.completions).toMatchObject([{cellId:'orion-lesson',correctAnswers:8,xpEarned:0}]);
    expect(p.questDone).toMatchObject([{questId:'daily-learn',xpEarned:20}]);
    expect(p.litStars).toEqual([]);
  });
  it('gives a complete diagnostic for misses without inventing a pass threshold',async()=>{
    const selected=answers(); selected['ex-01-double']=['a'];
    const result=await submitLessonExam(db,content,'one',lesson.id,selected,now);
    expect(result.correct).toBe(7);
    expect(await db.answers.get(['one','ex-01-double'])).toMatchObject({correct:false,attempts:1});
    expect(await db.completions.count()).toBe(1);
  });
  it('rejects an unfinished exam without saving answers, completion or rewards',async()=>{
    const selected=answers();delete selected['ex-01-double'];
    await expect(submitLessonExam(db,content,'one',lesson.id,selected,now)).rejects.toThrow('every question');
    for(const rows of Object.values(await readProgress(db)))expect(rows).toEqual([]);
  });
  it('keeps repeats and simultaneous submissions from duplicating rewards or original assessment',async()=>{
    await Promise.all([submitLessonExam(db,content,'one',lesson.id,answers(),now),submitLessonExam(db,content,'one',lesson.id,answers(),now)]);
    const before=await readProgress(db);
    const selected=answers();selected['ex-01-double']=['a'];
    expect((await submitLessonExam(db,content,'one',lesson.id,selected,new Date('2026-10-28T12:00:00Z'))).correct).toBe(7);
    expect(await readProgress(db)).toEqual(before);
  });
  it('rolls back all answers if the completion write fails',async()=>{
    vi.spyOn(db.completions,'add').mockRejectedValueOnce(new Error('Storage full'));
    await expect(submitLessonExam(db,content,'one',lesson.id,answers(),now)).rejects.toThrow('Storage full');
    for(const rows of Object.values(await readProgress(db)))expect(rows).toEqual([]);
  });
});
