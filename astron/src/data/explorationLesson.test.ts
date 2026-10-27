import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sampleContent } from './contentFixtures';
import { validateExplorationLesson } from './explorationLesson';
import { gradeLessonExam, modelAtSunWidth } from '../logic/lessonExam';
import { correctSelection, exerciseItems } from '../logic/lessonPlayer';

const content = sampleContent();
const lesson = content.lessons.find(row => row.id === 'patterns')!;
const raw = () => JSON.parse(readFileSync(new URL('../../public/content/lesson-01.json', import.meta.url), 'utf8'));
const correct = () => Object.fromEntries(lesson.cards.flatMap(card => card.kind === 'exercise' ? [[card.exerciseId, correctSelection(content.exercises.find(e=>e.id===card.exerciseId)!)]] : []));

describe('The full scale lesson', () => {
  it('has eight substantial sections, an eight-question exam and two questions per topic', () => {
    const data = validateExplorationLesson(raw(), lesson, content);
    expect(data.sections).toHaveLength(8);
    expect(data.sections.flatMap(s=>s.paragraphs).join(' ').split(/\s+/).length).toBeGreaterThan(600);
    expect(data.questions).toHaveLength(8);
    for (const t of data.topics) expect(data.questions.filter(q=>q.topicId===t.id)).toHaveLength(2);
  });
  it.each(['unknown-exercise', 'unknown-topic', 'unknown-section', 'unsafe-source'])('rejects %s before showing a lesson', kind => {
    const data = raw();
    if (kind==='unknown-exercise') data.questions[0].exerciseId='missing';
    if (kind==='unknown-topic') data.questions[0].topicId='missing';
    if (kind==='unknown-section') data.topics[0].reviewSection='missing';
    if (kind==='unsafe-source') data.sources[0].url='javascript:alert(1)';
    expect(()=>validateExplorationLesson(data,lesson,content)).toThrow();
  });
  it('grades order and reasoning questions only after all answers are complete', () => {
    expect(gradeLessonExam(lesson,content,correct()).correct).toBe(8);
    const answers = correct(); answers['ex-01-address']=[...answers['ex-01-address']].reverse();
    expect(gradeLessonExam(lesson,content,answers).correct).toBe(7);
    delete answers['ex-01-double'];
    expect(()=>gradeLessonExam(lesson,content,answers)).toThrow('every question');
  });
  it('rejects invented options and duplicated order items', () => {
    const answers=correct(); answers['ex-01-double']=['made-up'];
    expect(()=>gradeLessonExam(lesson,content,answers)).toThrow();
    answers['ex-01-double']=correct()['ex-01-double'];
    answers['ex-01-address']=exerciseItems(content.exercises.find(e=>e.id==='ex-01-address')!).map(()=> 'earth');
    expect(()=>gradeLessonExam(lesson,content,answers)).toThrow();
  });
});

describe('An honest proportional model', () => {
  it('calculates the model from the cited NASA measurements', () => {
    const model=modelAtSunWidth(10);
    expect(model.earthMm).toBeCloseTo(.9143,3);
    expect(model.earthM).toBeCloseTo(10.6857,3);
    expect(model.neptuneM).toBeCloseTo(321.0714,3);
    expect(model.neighbourKm).toBeCloseTo(2831.7143,3);
  });
  it('changes widths and distances by the same factor', () => {
    for(const key of Object.keys(modelAtSunWidth(10)) as (keyof ReturnType<typeof modelAtSunWidth>)[]) {
      expect(modelAtSunWidth(20)[key]).toBeCloseTo(modelAtSunWidth(10)[key]*2);
      expect(modelAtSunWidth(5)[key]).toBeCloseTo(modelAtSunWidth(10)[key]/2);
    }
  });
  it.each([NaN,Infinity,0,21])('rejects an invalid model width %s', value=>expect(()=>modelAtSunWidth(value)).toThrow());
});
