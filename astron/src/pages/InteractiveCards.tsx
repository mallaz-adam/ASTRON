import { useRef, useState } from 'react';
import { Button } from '../design/Button';
import { gapFlags, gapPosition, gapState, gapTicks, heatState, massRadius, nearbyFlag, raceState, starColour } from '../logic/lessonDiagrams';
import { DiagramPlate, FuelPicture, StarDisc } from './StarDiagrams';
import { LessonSlider } from './LessonSlider';
import { useControlledRace } from './useControlledRace';
import './InteractiveCards.css';

export type DiagramEvent = 'dialRedEnd' | 'gapFlagFew' | 'gapFlagTen';
type InteractiveKind = 'dial' | 'mass' | 'race' | 'gap';

function HeatDial({ react }: { react: (event: DiagramEvent) => void }) {
  const [heat, setHeat] = useState(.5);
  const redSeen = useRef(false);
  function change(value: number) {
    setHeat(value);
    if (value === 0 && !redSeen.current) { redSeen.current = true; react('dialRedEnd'); }
  }
  return <div className="interactive-card heat-dial">
    <DiagramPlate label={heatState(heat)}><StarDisc x={159} y={75} radius={26} colour={starColour(heat)} halo={35 + heat * 6} /></DiagramPlate>
    <LessonSlider label="Heat" value={heat} state={heatState(heat)} change={change} left="cooler" right="hotter" />
  </div>;
}

function MassSlider() {
  const [mass, setMass] = useState(0);
  const state = `Mass: ${mass <= .5 ? 'lighter' : 'heavier'}`;
  return <div className="interactive-card mass-slider">
    <DiagramPlate label={state}><StarDisc x={159} y={75} radius={massRadius(mass)} colour={starColour(mass)} /></DiagramPlate>
    <LessonSlider label="Mass" value={mass} state={state} change={setMass} left="lighter" right="heavier" />
    <p className="diagram-note">A picture, not to scale.</p>
  </div>;
}

export function RaceControls({ race, reduceMotion }: { race: ReturnType<typeof useControlledRace>; reduceMotion: boolean }) {
  return <div className="race-controls">
    <LessonSlider label="time" value={race.time} state={raceState(race.time)} change={race.seek} />
    {!reduceMotion && <Button variant="secondary" aria-pressed={race.playing} onClick={race.playing ? race.pause : race.play}>{race.playing ? 'PAUSE' : 'PLAY'}</Button>}
  </div>;
}

function FuelRace({ reduceMotion, active }: { reduceMotion: boolean; active: boolean }) {
  const race = useControlledRace(reduceMotion, active);
  return <div className="interactive-card fuel-race">
    <FuelPicture time={race.time} />
    <div className="race-labels"><span>heavier star</span><span>lighter star</span></div>
    <RaceControls race={race} reduceMotion={reduceMotion} />
    <p className="diagram-note">A picture to help think, not a real container.</p>
  </div>;
}

function GapLine({ react }: { react: (event: DiagramEvent) => void }) {
  const [position, setPosition] = useState(0);
  const lastFlag = useRef<string | undefined>(undefined);
  function change(value: number) {
    setPosition(value);
    const flag = nearbyFlag(value);
    if (flag && lastFlag.current !== flag.id) react(flag.event);
    lastFlag.current = flag?.id;
  }
  const pointer = 24 + position * 270;
  return <div className="interactive-card gap-line">
    <DiagramPlate label={gapState(position)} height={130}>
      <line x1="24" y1="80" x2="294" y2="80" stroke="var(--parchment)" />
      {gapTicks.map(tick => <line key={tick.years} x1={24 + gapPosition(tick.years) * 270} y1="73"
        x2={24 + gapPosition(tick.years) * 270} y2="91" stroke="var(--parchment)" />)}
      {gapFlags.map(flag => {
        const x = 24 + flag.position * 270;
        return <g key={flag.id} className={`gap-flag gap-flag--${flag.id}`}>
          <line x1={x} y1="28" x2={x} y2="80" stroke="var(--gold)" />
          <path d={`M${x} 28l12 6-12 6Z`} fill="var(--gold)" />
        </g>;
      })}
      <path className="gap-pointer" d={`M${pointer - 6} 103l6-10 6 10Z`} fill="var(--parchment)" />
    </DiagramPlate>
    <div className="gap-ticks" aria-hidden="true">{gapTicks.map(tick => <span key={tick.years}>{tick.label}</span>)}</div>
    <div className="gap-flag-labels">{gapFlags.map(flag => <button key={flag.id} type="button" onClick={() => change(flag.position)}>{flag.label}</button>)}</div>
    <LessonSlider label="years" value={position} state={gapState(position)} change={change} />
  </div>;
}

export function InteractiveCard({ kind, react, reduceMotion, active }: {
  kind: InteractiveKind; react: (event: DiagramEvent) => void; reduceMotion: boolean; active: boolean;
}) {
  if (kind === 'dial') return <HeatDial react={react} />;
  if (kind === 'mass') return <MassSlider />;
  if (kind === 'race') return <FuelRace reduceMotion={reduceMotion} active={active} />;
  return <GapLine react={react} />;
}
