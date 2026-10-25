import { useId } from 'react';
import type { TaleExperienceData } from '../../data/taleExperience';
import type { BeltChoice } from '../../logic/taleJourney';
import { projectOrion } from '../../logic/orionChart';

export function OrionChart({ data, highlight, labels = false, connections = true, activity = false }: {
  data: TaleExperienceData; highlight?: BeltChoice | 'star'; labels?: boolean; connections?: boolean; activity?: boolean;
}) {
  const id = useId();
  const points = data.chart.stars.map(star => ({ ...star, ...projectOrion(star) }));
  const selected = new Set(highlight === 'star' ? ['betelgeuse'] : data.activity.groups.find(group => group.id === highlight)?.starIds ?? []);
  const byId = new Map(points.map(point => [point.id, point]));
  return <svg className="orion-chart" viewBox="0 0 360 440" role="img" aria-labelledby={`${id}-title ${id}-description`}>
    <title id={`${id}-title`}>Orion, seen from Earth</title>
    <desc id={`${id}-description`}>{activity
      ? 'Seven selected stars from Orion. Use the group buttons and pattern descriptions to choose a pattern.'
      : "Two stars mark the shoulders and two mark the feet. Three close stars form an almost-straight belt between them. Betelgeuse is at the upper left."}</desc>
    {connections && <g className="orion-connections">{data.chart.connections.map(([a, b]) => {
      const first = byId.get(a)!; const second = byId.get(b)!;
      return <line key={`${a}-${b}`} x1={first.x} y1={first.y} x2={second.x} y2={second.y} />;
    })}</g>}
    {points.map(point => <g key={point.id} className={`orion-point ${selected.has(point.id) ? 'orion-point--selected' : ''}`}>
      {selected.has(point.id) && <circle className="orion-point-ring" cx={point.x} cy={point.y} r="12" />}
      <circle className="orion-point-halo" cx={point.x} cy={point.y} r={point.id === 'betelgeuse' || point.id === 'rigel' ? 10 : 7} />
      <circle className={point.id === 'betelgeuse' ? 'orion-star orion-star--red' : 'orion-star'} cx={point.x} cy={point.y} r={point.id === 'betelgeuse' || point.id === 'rigel' ? 4.5 : 3} />
    </g>)}
    {labels && <g className="orion-labels">
      <text x="24" y="48">Betelgeuse</text>
      <text x="216" y="247">Orion's belt</text>
      <text x="270" y="374">Rigel</text>
    </g>}
    {activity && <g className="orion-group-labels" aria-hidden="true"><text x="180" y="55">A</text><text x="220" y="225">B</text><text x="182" y="390">C</text></g>}
  </svg>;
}
