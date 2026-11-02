import { useState } from 'react';
import type { GalaxiesUnitData, GalaxyQuestion } from '../data/galaxiesUnit';
import { galaxyFeedback } from '../logic/galaxies';
import { GlauxArt } from '../design/InlineArt';

export function GalaxyPracticeQuestion({ question, explanation, onAnswer }: { question: GalaxyQuestion; explanation?: string; onAnswer?: (answer: string) => void }) {
  const [answer, setAnswer] = useState('');
  const feedback = galaxyFeedback(question, answer);
  return <div className="unit-practice-content"><fieldset className="unit-choices"><legend>{question.prompt}</legend>
    {question.options.map(option => <label key={option.id}><input type="radio" name={`galaxy-${question.id}`} value={option.id} checked={answer === option.id} onChange={() => { setAnswer(option.id); onAnswer?.(option.id); }} /><span>{option.id.length === 1 ? `${option.id}. ` : ''}{option.text}</span></label>)}
  </fieldset>{feedback && <div className="unit-feedback" role="status"><GlauxArt mood={feedback.correct ? 'proud' : 'gentle'} /><p>{feedback.text}</p>{feedback.correct && explanation && <p>{explanation}</p>}</div>}</div>;
}

export function GalaxiesPractice({ data, kind, questionIndex = 0, onAttempt }: { data: GalaxiesUnitData; kind: 'choice' | 'evidence'; questionIndex?: number; onAttempt?: () => void }) {
  return <div className="unit-practice-content">
      {kind === 'choice' ? <GalaxyPracticeQuestion question={data.choice} explanation={data.choice.explanation} onAnswer={() => onAttempt?.()} /> : <><p className="unit-caption">Question {questionIndex + 1} of {data.evidence.questions.length}</p>{data.evidence.questions.map((question, index) => <div key={question.id} hidden={index !== questionIndex}><GalaxyPracticeQuestion question={question} onAnswer={() => onAttempt?.()} /></div>)}</>}
      <details className="unit-hint"><summary>Hint from Glaux</summary><p>{kind === 'choice' ? data.choice.hint : data.evidence.hint}</p></details>
  </div>;
}
