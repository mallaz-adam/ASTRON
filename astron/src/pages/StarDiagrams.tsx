import type { ReactNode } from 'react';
import { fuelLevels, raceState, starTints } from '../logic/lessonDiagrams';

export function DiagramPlate({ children, label, height = 150, width = 318, decorative = false }: {
  children: ReactNode; label?: string; height?: number; width?: number; decorative?: boolean;
}) {
  return <svg className="diagram-plate" viewBox={`0 0 ${width} ${height}`} role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : label} aria-hidden={decorative || undefined}>
    <rect width={width} height={height} fill="var(--lapis)" />
    <rect x="5" y="5" width={width - 10} height={height - 10} fill="none" stroke="var(--gold)" strokeOpacity={.6} strokeDasharray="1 6" />
    {children}
  </svg>;
}

export function StarDisc({ x, y, radius, colour, halo = radius * 1.35, brightness = 1 }: {
  x: number; y: number; radius: number; colour: string; halo?: number; brightness?: number;
}) {
  return <g className="schematic-star">
    <circle className="schematic-halo" cx={x} cy={y} r={halo} fill={colour} fillOpacity={.18 * brightness} />
    <circle className="schematic-disc" cx={x} cy={y} r={radius} fill={colour} fillOpacity={brightness}
      stroke={colour} strokeOpacity={brightness === 0 ? .25 : .65} strokeWidth="1" />
  </g>;
}

function FueledStar({ heavier, time, x }: { heavier: boolean; time: number; x: number }) {
  const fuel = fuelLevels(time);
  const height = heavier ? 100 : 60;
  const level = heavier ? fuel.heavier : fuel.lighter;
  return <g className={heavier ? 'fuel-star fuel-star--heavier' : 'fuel-star fuel-star--lighter'}>
    <StarDisc x={x} y={62} radius={heavier ? 32 : 20} colour={heavier ? starTints.blue : starTints.red}
      brightness={heavier ? fuel.heavyBrightness : 1} />
    <rect className="fuel-gauge" x={x - 13} y={220 - height} width="26" height={height}
      fill="none" stroke="var(--parchment)" strokeWidth="1" />
    <rect className="fuel-fill" x={x - 11} y={219 - (height - 2) * level} width="22" height={(height - 2) * level} fill="var(--gold-light)" />
  </g>;
}

export function FuelPicture({ time, star }: { time: number; star?: 'heavier' | 'lighter' }) {
  const single = star !== undefined;
  return <DiagramPlate label={raceState(time)} height={240} width={single ? 150 : 318} decorative={single}>
    {star !== 'lighter' && <FueledStar heavier time={time} x={single ? 75 : 88} />}
    {star !== 'heavier' && <FueledStar heavier={false} time={time} x={single ? 75 : 230} />}
  </DiagramPlate>;
}
