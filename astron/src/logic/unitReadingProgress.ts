import { practiceAfterScene } from './unitPractice';

type ReadingStep = { index: number; kind: 'introduction' | 'reading' | 'practice' | 'recap'; question: number };

// Count the screens the learner actually visits, including each practice question.
// This is reading position, not a score or a replacement for saved completion.
export function unitReadingSequence(lessonId: string, steps: readonly { scene: string }[], recap: boolean, questionCounts: Record<string, number> = {}): ReadingStep[] {
  const sequence: ReadingStep[] = [{ index: -1, kind: 'introduction', question: 0 }];
  steps.forEach((step, index) => {
    sequence.push({ index, kind: ['recap', 'solar-recap'].includes(step.scene) ? 'recap' : 'reading', question: 0 });
    if (practiceAfterScene(lessonId, step.scene)) {
      const count = questionCounts[step.scene] ?? 1;
      for (let question = 0; question < count; question++) sequence.push({ index, kind: 'practice', question });
    }
  });
  if (recap) sequence.push({ index: steps.length, kind: 'recap', question: 0 });
  return sequence;
}

export function unitReadingPosition(sequence: readonly ReadingStep[], state: { index: number; practicing: boolean; question: number; finished: boolean }) {
  const at = state.finished ? sequence.length - 1 : sequence.findIndex(step => step.index === state.index &&
    (state.practicing ? step.kind === 'practice' && step.question === state.question : step.kind !== 'practice'));
  if (at < 0) throw new Error('This reading position is not in the unit.');
  return { current: at + 1, total: sequence.length, kind: sequence[at].kind };
}
