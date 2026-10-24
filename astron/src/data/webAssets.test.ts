import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url));
describe('Private-test and offline assets', () => {
  it('ships noindex and a robots rule that disallows everything', () => {
    expect(read('index.html').toString()).toContain('name="robots" content="noindex, nofollow"');
    expect(read('public/robots.txt').toString().replace(/\r\n/g, '\n')).toBe('User-agent: *\nDisallow: /\n');
  });
  it('bundles real WOFF2 files with licenses and no Google Fonts runtime request', () => {
    for (const name of ['cinzel-latin-400', 'im-fell-english-latin-400', 'im-fell-english-latin-400-italic']) {
      expect(read(`public/fonts/${name}.woff2`).subarray(0, 4).toString()).toBe('wOF2');
    }
    expect(read('public/fonts/Cinzel-OFL.txt').toString()).toContain('SIL OPEN FONT LICENSE');
    expect(read('public/fonts/IM-Fell-English-OFL.txt').toString()).toContain('SIL OPEN FONT LICENSE');
    expect(read('index.html').toString()).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  });
  it.each([['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512], ['apple-touch-icon.png', 180]] as const)('exports %s at its required size', (name, size) => {
    const png = read(`public/icons/${name}`);
    expect(png.readUInt32BE(16)).toBe(size); expect(png.readUInt32BE(20)).toBe(size);
    expect(read('public/icons/test-icon.svg').toString()).toContain('#1E2D52');
    expect(read('public/icons/test-icon.svg').toString()).toContain('#E8C46A');
  });
});
