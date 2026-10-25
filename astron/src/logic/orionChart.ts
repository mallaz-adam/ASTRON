import type { ChartStar } from '../data/taleExperience';

// Gnomonic projection centred on Orion's belt: north up, east left. Coordinates
// are ICRS/J2000, not artist-drawn screen positions or a live visibility claim.
export function projectOrion(star: Pick<ChartStar, 'raDegrees' | 'decDegrees'>) {
  const radians = Math.PI / 180;
  const delta = (star.raDegrees - 84) * radians;
  const dec = star.decDegrees * radians;
  const centre = -1 * radians;
  const denominator = Math.sin(centre) * Math.sin(dec) + Math.cos(centre) * Math.cos(dec) * Math.cos(delta);
  if (denominator <= 0) throw new Error('This star is outside the Orion chart.');
  return {
    x: 180 - 1000 * Math.cos(dec) * Math.sin(delta) / denominator,
    y: 220 - 1000 * (Math.cos(centre) * Math.sin(dec) - Math.sin(centre) * Math.cos(dec) * Math.cos(delta)) / denominator,
  };
}
