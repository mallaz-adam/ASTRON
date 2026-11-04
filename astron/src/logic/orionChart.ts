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

// Fit a small pattern without changing its proportions or point order.
export function orionPattern(stars: readonly ChartStar[], ids: readonly string[], comparisonGroups: readonly (readonly string[])[] = [ids]) {
  function project(ids: readonly string[]) { return ids.map(id => {
    const star = stars.find(star => star.id === id);
    if (!star) throw new Error('This pattern includes an unknown star.');
    return { id, ...projectOrion(star) };
  }); }
  const points = project(ids);
  const xs = points.map(point => point.x); const ys = points.map(point => point.y);
  const centreX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centreY = (Math.min(...ys) + Math.max(...ys)) / 2;
  const extents = comparisonGroups.map(group => {
    const points = project(group);
    return { width: Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)), height: Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)) };
  });
  const scale = Math.min(80 / (Math.max(...extents.map(e => e.width)) || 1), 48 / (Math.max(...extents.map(e => e.height)) || 1));
  return points.map(point => ({ id: point.id, x: 50 + (point.x - centreX) * scale, y: 38 + (point.y - centreY) * scale }));
}
