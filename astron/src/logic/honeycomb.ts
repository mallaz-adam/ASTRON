const radius = 50;
const width = radius * Math.sqrt(3);
const padding = 8;
export const honeycombSize = { radius, width: width * 4 + padding * 2, height: radius * 5 + padding * 2 };

// The middle row runs back toward the left, with its centres half a cell over.
export function hexPosition(index: number) {
  if (!Number.isInteger(index) || index < 0 || index > 10) throw new RangeError('The honeycomb has eleven positions.');
  const row = index < 4 ? 0 : index < 7 ? 1 : 2;
  const column = row === 0 ? index + .5 : row === 1 ? 7 - index : index - 7 + .5;
  return { x: padding + column * width, y: padding + radius + row * radius * 1.5 };
}

export function hexPoints(x: number, y: number, r = radius - 3): string {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (index * 60 - 90) * Math.PI / 180;
    return `${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`;
  }).join(' ');
}

export function titleLines(title: string): string[] {
  if (title.length <= 12) return [title];
  const words = title.split(' ');
  let split = 1;
  for (let i = 2; i < words.length; i++) {
    if (Math.max(words.slice(0, i).join(' ').length, words.slice(i).join(' ').length)
      < Math.max(words.slice(0, split).join(' ').length, words.slice(split).join(' ').length)) split = i;
  }
  return [words.slice(0, split).join(' '), words.slice(split).join(' ')];
}
