import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProgressSegments } from './ProgressSegments';

const tokens = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

function colour(name: string) {
  const match = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'));
  if (!match) throw new Error(`Missing colour token: ${name}`);
  return match[1];
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map(start => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

describe('Design accessibility', () => {
  it.each([
    ['ink', 'parchment'], ['soft-ink', 'parchment'],
    ['ink', 'card'], ['soft-ink', 'card'],
    ['ink', 'panel'], ['soft-ink', 'panel'],
    ['vermilion', 'panel'], ['vermilion', 'card'],
    ['parchment', 'vermilion'], ['parchment', 'ink'],
  ])('%s text on %s has at least 4.5:1 contrast', (text, background) => {
    const a = luminance(colour(text));
    const b = luminance(colour(background));
    expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('Progress segments', () => {
  it('describes partial progress to a screen reader', () => {
    const html = renderToStaticMarkup(<ProgressSegments label="Example" filled={3} total={6} />);
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="3"');
    expect(html).toContain('aria-valuemax="6"');
  });

  it.each([[-1, 6], [7, 6], [0, 0], [1.5, 6], [1, 2.5]])('rejects invalid progress %s / %s', (filled, total) => {
    expect(() => renderToStaticMarkup(<ProgressSegments label="Example" filled={filled} total={total} />)).toThrow(RangeError);
  });
});
