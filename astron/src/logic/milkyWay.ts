import type { MilkyWayUnitData } from '../data/milkyWayUnit';

export function milkyChoiceFeedback(unit: MilkyWayUnitData, answer: string) {
  const option = unit.choice.options.find(o => o.id === answer);
  return option ? { correct: option.id === unit.choice.correct, text: option.feedback } : null;
}

export function milkyMatchingFeedback(unit: MilkyWayUnitData, answers: Record<string, string>) {
  return unit.matching.cards.map(card => ({
    id: card.id, correct: answers[card.id] === card.group,
    text: !answers[card.id] ? 'Choose a view for this description.'
      : answers[card.id] === card.group ? unit.matching.groups.find(g => g.id === card.group)!.label
      : card.feedback,
  }));
}

// Unit 3 has ten teaching screens AND a separate recap. Complete only after it.
export function milkyReadingPosition(index: number, teachingCount: number) {
  if (index < 0) return 'introduction';
  return index < teachingCount ? 'teaching' : 'recap';
}
