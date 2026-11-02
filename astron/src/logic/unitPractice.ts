const practiceSteps = {
  'unit-earth-sun-moon': [
    { scene: 'paths', kind: 'matching', title: 'Know the three objects' },
    { scene: 'comparison', kind: 'choice', title: 'Follow the moonlight' },
  ],
  'unit-our-solar-system': [
    { scene: 'planet-order', kind: 'order', title: 'Put the inner planets in order' },
    { scene: 'pluto', kind: 'sorting', title: 'Sort the solar family' },
  ],
  'unit-stars-milky-way': [
    { scene: 'galactic-home', kind: 'choice', title: 'Explain our galaxy' },
    { scene: 'two-views', kind: 'matching', title: 'Match the two views' },
  ],
  'unit-galaxies-universe': [
    { scene: 'home', kind: 'choice', title: 'Find our place' },
    { scene: 'reconstruction', kind: 'evidence', title: 'Read the evidence' },
  ],
} satisfies Record<string, { scene: string; kind: string; title: string }[]>;

export function practiceAfterScene(lessonId: string, scene: string) {
  const list = practiceSteps[lessonId as keyof typeof practiceSteps];
  const index = list?.findIndex(item => item.scene === scene) ?? -1;
  return index >= 0 ? { ...list[index], number: index + 1, total: list.length } : null;
}

// An attempt means every answer was supplied and its feedback was shown.
// Correctness never controls whether this practice is complete.
export function practiceAttempted(answers: readonly (string | undefined)[], feedbackShown: boolean) {
  return feedbackShown && answers.length > 0 && answers.every(answer => typeof answer === 'string' && answer.length > 0);
}
