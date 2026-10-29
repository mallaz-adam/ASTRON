import type { ObjectId, ObjectKind, VisualUnitData } from '../data/visualUnit';

// Schematic positions only: this is not an astronomical simulation.
export function orbitPoint(value: number, close = false) {
  const angle = Math.max(0, Math.min(100, value)) / 100 * Math.PI * 2 - Math.PI / 2;
  return { x: 210 + Math.cos(angle) * (close ? 92 : 100), y: 146 + Math.sin(angle) * (close ? 90 : 96) };
}

export function orbitWords(value: number, close = false) {
  const position = value === 0 ? 'at the start of the pictured path'
    : value === 100 ? 'back at the start of the pictured path'
    : value <= 25 ? 'moving along the first part of the pictured path'
    : value <= 50 ? 'moving along the next part of the pictured path'
    : value <= 75 ? 'moving along the far side of the pictured path'
    : 'moving back towards the start of the pictured path';
  return `${close ? 'Moon' : 'Earth'}: ${position}.`;
}

export function matchingFeedback(unit: VisualUnitData, answers: Partial<Record<ObjectId, ObjectKind>>) {
  return unit.objects.map(object => {
    const selected = answers[object.id];
    return { id: object.id, correct: selected === object.kind,
      text: !selected ? `Choose a label for ${object.name}.`
        : selected === object.kind ? `${object.name}: ${object.kind}.`
        : unit.matching.feedback[object.id][selected]! };
  });
}
