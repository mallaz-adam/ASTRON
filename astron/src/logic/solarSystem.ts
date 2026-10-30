import type { SolarSystemUnitData } from '../data/solarSystemUnit';

export function innerOrderFeedback(unit: SolarSystemUnitData, answers: string[]) {
  return unit.orderPractice.correctOrder.map((id, index) => ({
    id, correct: answers[index] === id,
    text: !answers[index] ? `Choose a planet for ${unit.orderPractice.positions[index].toLowerCase()}.`
      : answers[index] === id ? `${unit.objects.find(i => i.id === id)!.name}: ${unit.orderPractice.positions[index].toLowerCase()}.`
      : unit.orderPractice.feedback[index],
  }));
}

export function solarSortingFeedback(unit: SolarSystemUnitData, answers: Record<string, string>) {
  return unit.sorting.cards.map(card => ({
    id: card.id, correct: answers[card.id] === card.group,
    text: !answers[card.id] ? `Choose a group for ${card.title}.`
      : answers[card.id] === card.group ? `${card.title}: ${unit.sorting.groups.find(g => g.id === card.group)!.label}.`
      : card.feedback,
  }));
}
