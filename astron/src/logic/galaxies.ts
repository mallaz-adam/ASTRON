import type { GalaxyQuestion } from '../data/galaxiesUnit';

// Practice is transient teaching feedback, never an assessment or XP record.
export function galaxyFeedback(question: GalaxyQuestion, answer: string) {
  const option = question.options.find(item => item.id === answer);
  return option ? { correct: option.id === question.correct, text: option.feedback } : null;
}

export function galaxyReadingPosition(index: number, teachingCount: number) {
  return index < 0 ? 'introduction' : index < teachingCount ? 'teaching' : 'recap';
}
