export const starTints = { red: '#D9735A', orange: '#E9B173', blue: '#A9C4EE' };

export function unitPosition(value: number): number {
  return Number.isNaN(value) ? 0 : Math.max(0, Math.min(1, value));
}

// Blend the supplied tints, rather than implying a measured stellar temperature.
export function starColour(position: number): string {
  const value = unitPosition(position);
  const from = value <= .5 ? starTints.red : starTints.orange;
  const to = value <= .5 ? starTints.orange : starTints.blue;
  const fraction = value <= .5 ? value * 2 : (value - .5) * 2;
  const channels = [1, 3, 5].map(index => {
    const start = parseInt(from.slice(index, index + 2), 16);
    const end = parseInt(to.slice(index, index + 2), 16);
    return Math.round(start + (end - start) * fraction).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`.toUpperCase();
}

export function heatState(position: number): string {
  const value = unitPosition(position);
  return `Heat: ${value < .25 ? 'cooler' : value > .75 ? 'hotter' : 'Orange star'}`;
}

export function massRadius(position: number): number {
  return 16 + 24 * unitPosition(position);
}

export function fuelLevels(position: number) {
  const time = unitPosition(position);
  const heavier = Math.max(0, 1 - time / .35);
  const lighter = 1 - .55 * time;
  return { heavier, lighter, heavyBrightness: heavier === 0 ? 0 : .2 + .8 * heavier };
}

export function raceState(position: number): string {
  return fuelLevels(position).heavier > 0 ? 'Both stars are shining.' : "The heavier star's fuel is gone. The lighter star still shines.";
}

export function advanceRace(position: number, elapsedMs: number): number {
  return unitPosition(position + Math.max(0, elapsedMs) / 6000);
}

export function answerRacePlan(status: 'ready' | 'missed' | 'correct' | 'revealed', reduceMotion: boolean) {
  if (status === 'missed') return { time: .25, play: false };
  if (status === 'correct' || status === 'revealed') return { time: reduceMotion ? 1 : 0, play: !reduceMotion };
  return { time: 0, play: false };
}

export function gapPosition(years: number): number {
  return unitPosition((Math.log10(Math.max(1_000_000, years)) - 6) / 4);
}

export const gapTicks = [
  { years: 1_000_000, label: '1 million years' },
  { years: 10_000_000, label: '10 million years' },
  { years: 100_000_000, label: '100 million years' },
  { years: 1_000_000_000, label: '1 billion years' },
  { years: 10_000_000_000, label: '10 billion years' },
];
export const gapFlags = [
  { id: 'few', position: gapPosition(3_000_000), label: 'a few million years', event: 'gapFlagFew' },
  { id: 'ten', position: gapPosition(10_000_000_000), label: 'about ten billion years', event: 'gapFlagTen' },
] as const;
export type GapFlag = typeof gapFlags[number];

export function nearbyFlag(position: number): GapFlag | undefined {
  return gapFlags.find(flag => Math.abs(unitPosition(position) - flag.position) <= .0125);
}

export function gapState(position: number): string {
  const value = unitPosition(position);
  const flag = nearbyFlag(value);
  if (flag) return flag.label;
  const tick = gapTicks.find(row => gapPosition(row.years) === value);
  if (tick) return tick.label;
  const left = Math.min(Math.floor(value * 4), 3);
  return `${gapTicks[left].label} – ${gapTicks[left + 1].label}`;
}
