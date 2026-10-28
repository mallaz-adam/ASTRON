import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sampleContent } from '../data/contentFixtures';
import { validateExplorationLesson } from '../data/explorationLesson';
import { ProgressProvider } from '../hooks/useProgress';
import { ExplorationReader, GuidedPractice } from './ExplorationLesson';

const content=sampleContent();
const lesson=content.lessons.find(l=>l.id==='patterns')!;
const data=validateExplorationLesson(JSON.parse(readFileSync(new URL('../../public/content/lesson-01.json',import.meta.url),'utf8')),lesson,content);
function render(model=false){
  const reader=model?{...data,sections:[data.sections[2],...data.sections.slice(1)]}:data;
  return renderToStaticMarkup(<ProgressProvider><MemoryRouter><ExplorationReader data={reader} lesson={lesson} content={content} reduceMotion /></MemoryRouter></ProgressProvider>);
}
describe('A comfortable, accessible lesson reader',()=>{
  it('starts with teaching and navigation, with no individual exam or score',()=>{
    const html=render();
    expect(html).toContain('Earth feels enormous');
    expect(html).toContain('<select');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('data-reduce-motion="true"');
    expect(html).not.toContain('Your answers, explained');
    expect(html).not.toContain('Start the exam');
    expect(html).not.toContain('class="lesson-scroll"');
  });
  it('labels guided practice as optional and presents choices without a score',()=>{
    const exercise=content.exercises.find(e=>e.id==='ex-01-double')!;
    const html=renderToStaticMarkup(<GuidedPractice exercise={exercise} />);
    expect(html).toContain('optional practice');
    expect(html).toContain('type="radio"');
    expect(html).toContain('Explore the answer');
    expect(html).not.toContain('answered correctly');
    expect(html).not.toContain('Submit exam');
  });
  it('exposes a real keyboard slider and calculated values in words',()=>{
    const html=render(true);
    expect(html).toContain('type="range"');
    expect(html).toContain('aria-valuetext="10 centimetres wide"');
    expect(html).toContain('About 0.9 mm');
    expect(html).toContain('aria-live="polite"');
  });
});
