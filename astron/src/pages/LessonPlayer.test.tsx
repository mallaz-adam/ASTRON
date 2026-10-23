import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { LessonPlayer } from './LessonPlayer';
import { LessonExercise } from './LessonExercise';

const content = sampleContent();
const lesson = content.lessons.find(row => row.id === 'lesson-03')!;

describe('Lesson controls and first render', () => {
  it('starts with one described picture, happy Glaux and a labelled native close control', () => {
    const html = renderToStaticMarkup(<MemoryRouter><LessonPlayer lesson={lesson} content={content} reduceMotion={false} /></MemoryRouter>);
    expect(html).toContain('aria-label="Close lesson"');
    expect(html).toContain('Three star discs of the same size, glowing blue, orange and red');
    expect(html).toContain('Glaux the owl, happy');
    expect(html.match(/class="lesson-card"/g)).toHaveLength(1);
    expect(html).toContain('Card 1 of 8');
    expect(html).toContain('A hunch is enough for now.');
    expect(html.match(/class="hunch-option"/g)).toHaveLength(3);
    expect(html).toContain('I&#x27;d rather not guess');
    expect(html).not.toContain('>CONTINUE<');
    expect(html).not.toContain('Arrange these stars');
  });
  it('applies the saved motion preference around the supplied SVG parts', () => {
    const html = renderToStaticMarkup(<MemoryRouter><LessonPlayer lesson={lesson} content={content} reduceMotion /></MemoryRouter>);
    expect(html).toContain('data-reduce-motion="true"');
    expect(html).toContain('class="head"'); expect(html).toContain('class="eye"');
  });
  it('uses labelled native radio inputs and an initially disabled CHECK', () => {
    const exercise = content.exercises.find(row => row.id === 'ex-03-choice')!;
    const html = renderToStaticMarkup(<LessonExercise exercise={exercise} answer={{ selection: [], attempts: 0, hintUsed: false, status: 'ready' }} busy={false} select={() => {}} undo={() => {}} check={() => {}} reveal={() => {}} hint={() => {}} />);
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    expect(html).toContain('The heavier star.');
    expect(html).toMatch(/disabled=""[^>]*>CHECK/);
    expect(html).not.toContain('SHOW ME');
  });
});
