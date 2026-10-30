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
  // Longer titles need three short lines to stay inside the sloping sides.
  if (title.length > 26) {
    const lines: string[] = [];
    for (const word of title.split(' ')) {
      const last = lines.length - 1;
      if (last >= 0 && `${lines[last]} ${word}`.length <= 12) lines[last] += ` ${word}`;
      else lines.push(word);
    }
    return lines;
  }
  if (title.length <= 12) return [title];
  const words = title.split(' ');
  let split = 1;
  for (let i = 2; i < words.length; i++) {
    if (Math.max(words.slice(0, i).join(' ').length, words.slice(i).join(' ').length)
      < Math.max(words.slice(0, split).join(' ').length, words.slice(split).join(' ').length)) split = i;
  }
  const pair = [words.slice(0, split).join(' '), words.slice(split).join(' ')];
  if (pair.every(line => line.length <= 12) || words.length < 3) return pair;
  // A third line also helps medium-length names with long individual phrases.
  let best = pair;
  let bestScore = Infinity;
  for (let first = 1; first < words.length - 1; first++) {
    for (let second = first + 1; second < words.length; second++) {
      const lines = [words.slice(0, first).join(' '), words.slice(first, second).join(' '), words.slice(second).join(' ')];
      const lengths = lines.map(line => line.length);
      const score = Math.max(...lengths) * 100 + Math.max(...lengths) - Math.min(...lengths);
      if (score < bestScore) { best = lines; bestScore = score; }
    }
  }
  return best;
}
