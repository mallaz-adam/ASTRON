import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import type { ObjectId, UnitObject, UnitScene, VisualUnitData } from '../data/visualUnit';
import { orbitPoint, orbitWords } from '../logic/visualUnit';

const names = { earth: 'Earth', sun: 'Sun', moon: 'Moon' };

// Gradients and a few irregular strokes give the diagrams a painted atlas finish.
// There are no canvas loops, filters, remote requests or automatic animations.
function Plate({ description, children, className = '' }: { description: string; children: ReactNode; className?: string }) {
  const id = useId().replace(/:/g, '');
  return <svg className={`unit-plate ${className}`} viewBox="0 0 420 300" role="img" aria-label={description}>
    <defs>
      <radialGradient id={`${id}-paper`}><stop stopColor="#31466e" /><stop offset="1" stopColor="#182540" /></radialGradient>
      <pattern id={`${id}-grain`} width="40" height="37" patternUnits="userSpaceOnUse">
        <path d="M2 7l11-2m8 19l12-3M6 33l6-1M28 10l7 1" stroke="#d7d4bd" strokeWidth=".65" opacity=".13" />
      </pattern>
      <marker id={`${id}-light`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L9 5 0 9" fill="none" stroke="context-stroke" strokeWidth="1.5" /></marker>
    </defs>
    <rect width="420" height="300" fill={`url(#${id}-paper)`} />
    <rect width="420" height="300" fill={`url(#${id}-grain)`} />
    <rect x="10" y="10" width="400" height="280" fill="none" stroke="#C9A44A" strokeDasharray="2 6" opacity=".6" />
    <g className="unit-stars" fill="#f3e8cc" opacity=".45" aria-hidden="true">
      {[ [42, 35], [340, 42], [375, 182], [56, 248], [298, 260], [136, 38], [373, 265], [98, 226], [265, 34] ].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.15" />)}
    </g>
    <g style={{ '--unit-arrow': `url(#${id}-light)` } as CSSProperties}>{children}</g>
  </svg>;
}

export function PaintedBody({ kind, x, y, r, halfLit = false }: { kind: ObjectId; x: number; y: number; r: number; halfLit?: boolean }) {
  const id = useId().replace(/:/g, '');
  const colours = kind === 'sun' ? ['#fff0bb', '#e9b173', '#bb6b39'] : kind === 'earth' ? ['#bed5cf', '#63989f', '#284c76'] : ['#efdfbf', '#b4b4a7', '#676f82'];
  return <g transform={`translate(${x} ${y})`} aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-pigment`} cx="32%" cy="32%" r="75%"><stop stopColor={colours[0]} /><stop offset=".6" stopColor={colours[1]} /><stop offset="1" stopColor={colours[2]} /></radialGradient>
      <clipPath id={`${id}-disc`}><circle r={r} /></clipPath>
    </defs>
    {kind === 'sun' && <><circle r={r * 1.36} fill="#e8c46a" opacity=".045" /><circle r={r * 1.17} fill="#e8c46a" opacity=".09" />{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 ${-r * 1.16}v${-r * .18}`} transform={`rotate(${i * 30})`} stroke="#E8C46A" strokeWidth="1" opacity=".65" />)}</>}
    <circle r={r} fill={`url(#${id}-pigment)`} stroke={colours[0]} strokeWidth=".6" />
    <g clipPath={`url(#${id}-disc)`}>
      {kind === 'earth' ? <>
        <path d={`M${-r * .75},${-r * .52}l${r * .56},${-r * .15} ${r * .48},${r * .46} ${-r * .27},${r * .45} ${r * .2},${r * .4} ${-r * .32},${r * .4} ${-r * .18},${-r * .58} ${-r * .43},${-r * .23}z`} fill="#aeb491" opacity=".9" />
        <path d={`M${r * .32},${-r * .58}q${r * .8},${r * .18} ${r * .3},${r * .63}l${-r * .3},${-r * .17}z`} fill="#9fae88" />
        <path d={`M${-r},${-r * .1}Q0,${-r * .52} ${r},${-r * .2}M${-r * .6},${r * .5}Q0,${r * .2} ${r * .9},${r * .4}`} fill="none" stroke="#f3eedb" strokeWidth={r * .12} opacity=".55" />
      </> : <>
        {[[-.36, -.3, .2], [.35, .2, .25], [-.16, .48, .12]].map(([cx, cy, size], i) => <circle key={i} cx={r * cx} cy={r * cy} r={r * size} fill={colours[2]} opacity=".2" />)}
        <path d={`M${-r * .8},${r * .22}Q0,${-r * .1} ${r * .8},${r * .18}M${-r * .4},${-r * .6}l${r * .6},${r * .12}`} fill="none" stroke={colours[0]} strokeWidth={r * .07} opacity=".25" />
      </>}
      {halfLit && <path d={`M0,${-r}A${r},${r} 0 0 1 0,${r}Q${-r * .27},0 0,${-r}`} fill="#182540" opacity=".85" />}
    </g>
    <circle r={r * .96} fill="none" stroke={colours[0]} strokeWidth=".65" strokeDasharray={`${r * .7} ${r * .3}`} opacity=".3" transform="rotate(12)" />
  </g>;
}

function Photo({ object }: { object: UnitObject }) {
  return <figure className="unit-photo">
    <div className="unit-photo-plate"><img src={object.src} alt={object.alt} width="640" height={object.id === 'moon' ? 622 : 640} decoding="async" /></div>
    <figcaption><span>{object.caption}</span><a href={object.source} target="_blank" rel="noreferrer">{object.credit}</a></figcaption>
  </figure>;
}

export function ObjectGallery({ objects, interactive = true }: { objects: UnitObject[]; interactive?: boolean }) {
  const [selected, setSelected] = useState<ObjectId>();
  return <div className="unit-gallery-wrap">
    <div className="unit-gallery">{objects.map(object => <div key={object.id} className="unit-gallery-item">
      {interactive ? <button type="button" aria-label={`${object.name}: uncover a clue`} aria-pressed={selected === object.id} onClick={() => setSelected(object.id)}>
        <img src={object.src} alt={object.alt} width="160" height="160" decoding="async" /><span>{object.name}</span>
      </button> : <><img src={object.src} alt={object.alt} width="160" height="160" decoding="async" /><span>{object.name}</span></>}
    </div>)}</div>
    {interactive && <p className="unit-picture-response" role="status">{selected ? `${names[selected]} — ${objects.find(o => o.id === selected)!.clue}.` : 'Choose an object to uncover a clue.'}</p>}
    <p className="unit-caption">Separate views — not to scale.</p>
  </div>;
}

function OrbitPicture({ value = 0, close = false, revealed = true }: { value?: number; close?: boolean; revealed?: boolean }) {
  const point = orbitPoint(value, close);
  return <Plate description={close ? 'A schematic shows the Moon on a dashed orbit around Earth. The arrow marks the direction of movement.' : 'A schematic shows Earth on a dashed orbit around the Sun. The arrow marks the direction of movement.'}>
    <ellipse cx="210" cy="146" rx={close ? 92 : 100} ry={close ? 90 : 96} fill="none" stroke="#e3d6b6" strokeWidth="1.2" strokeDasharray="4 6" opacity={revealed ? .8 : .24} />
    <path d={close ? 'M298 110q14 34 0 67' : 'M306 110q13 34 0 67'} fill="none" stroke="#f3e8cc" className="unit-arrow" />
    <PaintedBody kind={close ? 'earth' : 'sun'} x={210} y={146} r={34} />
    <PaintedBody kind={close ? 'moon' : 'earth'} x={point.x} y={point.y} r={close ? 14 : 20} />
    <text x="210" y="205" textAnchor="middle">{close ? 'Earth' : 'Sun'}</text>
    <text x={Math.min(355, Math.max(65, point.x))} y={point.y > 220 ? point.y - 26 : point.y + 39} textAnchor="middle">{close ? 'Moon' : 'Earth'}</text>
    <text x="210" y="274" textAnchor="middle">{close ? 'Moon around Earth' : 'Earth around the Sun'}</text>
  </Plate>;
}

export function OrbitExplorer({ close = false }: { close?: boolean }) {
  const [value, setValue] = useState(0);
  const [revealed, setRevealed] = useState(close);
  return <div className="unit-widget">
    <OrbitPicture value={value} close={close} revealed={revealed} />
    {!revealed && <button type="button" className="unit-small-button" onClick={() => setRevealed(true)}>Show orbit</button>}
    <label className="unit-slider"><span>Move {close ? 'the Moon' : 'Earth'} along its orbit</span>
      <input type="range" min="0" max="100" value={value} aria-valuetext={orbitWords(value, close)} onChange={e => { setValue(Number(e.target.value)); setRevealed(true); }} />
    </label>
    <p className="unit-picture-response" role="status">{orbitWords(value, close)}</p>
    <p className="unit-caption">Concept diagram — not to scale. Dashed line: orbit. Arrow: movement direction.</p>
  </div>;
}

function Paths() {
  const [close, setClose] = useState(false);
  return <div className="unit-widget"><div className="unit-switches" role="group" aria-label="Compare the paths">
    <button type="button" aria-pressed={!close} onClick={() => setClose(false)}>Wide view</button>
    <button type="button" aria-pressed={close} onClick={() => setClose(true)}>Close view</button>
  </div><OrbitPicture close={close} /><p className="unit-picture-response" role="status">{close ? 'The Moon travels around Earth.' : 'Earth travels around the Sun.'}</p>
    <p className="unit-caption">Concept diagrams — not to scale. The two views use different scales.</p>
  </div>;
}

function Sunlight({ reflection = false }: { reflection?: boolean }) {
  const [destination, setDestination] = useState<'earth' | 'moon'>('earth');
  const [stage, setStage] = useState(0);
  return <div className="unit-widget">
    <Plate description={reflection ? 'Sunlight reaches the sun-facing side of the Moon. Some light scatters towards a person on Earth. The Sun, Moon and Earth are shown offset from one another.' : 'Two straight light paths lead from the Sun, one to Earth and one to the Moon. These are light directions, not orbits.'}>
      <PaintedBody kind="sun" x={65} y={155} r={29} /><text x="65" y="210" textAnchor="middle">Sun</text>
      <PaintedBody kind="earth" x={337} y={218} r={28} /><text x="337" y="267" textAnchor="middle">Earth</text>
      <PaintedBody kind="moon" x={250} y={85} r={23} halfLit /><text x="250" y="45" textAnchor="middle">Moon</text>
      {reflection ? <>
        {stage > 0 && <path d="M98 146L230 101" stroke="#e8c46a" className="unit-arrow" />}
        {stage > 1 && <><path d="M250 109L317 194" stroke="#b8d5ee" className="unit-arrow" /><path d="M250 109l-11 43m11-43l49 13" stroke="#b8d5ee" strokeWidth="1" opacity=".45" /><circle cx="318" cy="195" r="3" fill="#f3e8cc" /></>}
      </> : <><path d="M97 162L302 209" stroke="#e8c46a" className="unit-arrow" opacity={destination === 'earth' ? 1 : .35} /><path d="M98 144L224 95" stroke="#e8c46a" className="unit-arrow" opacity={destination === 'moon' ? 1 : .35} /></>}
      <text x="155" y="270" textAnchor="middle">{reflection && stage > 1 ? 'Reflected sunlight' : 'Sunlight'}</text>
    </Plate>
    {reflection ? <>
      <button type="button" className="unit-small-button" onClick={() => setStage(stage === 2 ? 0 : stage + 1)}>{stage === 0 ? 'Follow sunlight' : stage === 1 ? 'Follow reflected light' : 'Show again'}</button>
      <p className="unit-picture-response" role="status">{stage === 0 ? 'Start at the Sun.' : stage === 1 ? 'Sunlight reaches the Moon’s rocky surface.' : 'Moonlight is reflected sunlight. Some reaches our eyes on Earth.'}</p>
    </> : <><div className="unit-switches" role="group" aria-label="Follow sunlight to a destination">
      <button type="button" aria-pressed={destination === 'earth'} onClick={() => setDestination('earth')}>Earth</button>
      <button type="button" aria-pressed={destination === 'moon'} onClick={() => setDestination('moon')}>Moon</button>
    </div><p className="unit-picture-response" role="status">Sunlight travels from the Sun to {names[destination]}.</p></>}
    <p className="unit-caption">Not to scale. Solid arrows show light travelling. {reflection && 'Gold: sunlight. Blue: reflected sunlight. The Moon scatters light in many directions.'}</p>
  </div>;
}

function Comparison() {
  const [reflectors, setReflectors] = useState(false);
  return <div className="unit-widget"><Plate description="An imaginary lamp sends light to a pale wall, then to an eye. Below, sunlight reaches the Moon and some reflected light reaches a person on Earth. The comparison is only about light.">
    <rect x={reflectors ? 241 : 45} y="35" width={reflectors ? 99 : 112} height="78" fill="none" stroke="#e8c46a" />
    <path d="M72 90h32m-16 0V69m-17 0 8-25h18l9 25z" stroke="#e9b173" fill="#e9b173" strokeWidth="2" />
    <path d="M283 43v54" stroke="#efe4c9" strokeWidth="9" /><path d="M111 66L273 66m10 14 60 35" stroke="#e8c46a" className="unit-arrow" />
    <path d="M345 109q12-10 23 0-11 10-23 0z" fill="none" stroke="#f3e8cc" /><circle cx="357" cy="109" r="3" fill="#f3e8cc" />
    <text x="88" y="133" textAnchor="middle">Lamp</text><text x="282" y="133" textAnchor="middle">Wall</text>
    <path d="M35 151h350" stroke="#f3e8cc" opacity=".2" />
    <rect x={reflectors ? 241 : 45} y="170" width={reflectors ? 99 : 112} height="78" fill="none" stroke="#e8c46a" />
    <PaintedBody kind="sun" x={88} y={207} r={22} /><PaintedBody kind="moon" x={282} y={207} r={19} halfLit />
    <path d="M120 207L255 207" stroke="#e8c46a" className="unit-arrow" /><path d="M286 226L345 251" stroke="#b8d5ee" className="unit-arrow" />
    <text x="88" y="274" textAnchor="middle">Sun</text><text x="282" y="274" textAnchor="middle">Moon</text>
  </Plate><div className="unit-switches" role="group" aria-label="Compare light sources and reflectors">
    <button type="button" aria-pressed={!reflectors} onClick={() => setReflectors(false)}>Makes light</button>
    <button type="button" aria-pressed={reflectors} onClick={() => setReflectors(true)}>Reflects light</button>
  </div><p className="unit-picture-response" role="status">{reflectors ? 'The wall reflects light. The Moon reflects sunlight.' : 'The lamp makes light. The Sun makes its own light.'}</p>
    <p className="unit-caption">Imaginary example. Comparison only about light, not to scale. The Moon is not a mirror.</p></div>;
}

function Recap({ data }: { data: VisualUnitData }) {
  const [shown, setShown] = useState(false);
  return <div className="unit-widget"><div className="unit-identity-cards">{data.objects.map(object => <div key={object.id}><span>{object.name}</span><span>{object.kind}</span></div>)}</div>
    <button type="button" className="unit-small-button" aria-expanded={shown} onClick={() => setShown(!shown)}>Show the connections</button>
    {shown && <div className="unit-connections" role="status"><p>Earth orbits the Sun. The Moon orbits Earth.</p><p>The Sun makes sunlight. The Moon reflects some towards us.</p></div>}
  </div>;
}

export function UnitPicture({ scene, data }: { scene: UnitScene; data: VisualUnitData }) {
  const [revealed, setRevealed] = useState(false);
  if (scene === 'gallery') return <ObjectGallery objects={data.objects} />;
  if (scene === 'orbit') return <OrbitExplorer />;
  if (scene === 'paths') return <Paths />;
  if (scene === 'sunlight' || scene === 'reflection') return <Sunlight reflection={scene === 'reflection'} />;
  if (scene === 'comparison') return <Comparison />;
  if (scene === 'recap') return <Recap data={data} />;
  const object = data.objects.find(o => o.id === scene)!;
  return <div className="unit-widget"><Photo object={object} />
    {scene === 'moon' ? <><OrbitPicture close /><p className="unit-caption">Concept diagram — not to scale.</p></> : <>
      <button type="button" className="unit-small-button" aria-expanded={revealed} onClick={() => setRevealed(!revealed)}>{scene === 'sun' ? 'Where does sunlight come from?' : 'What kind of object is Earth?'}</button>
      {revealed && <p className="unit-picture-response" role="status">{scene === 'sun' ? 'Energy made inside the Sun powers its light.' : 'Earth is a planet. It travels around the Sun.'}</p>}
    </>}
  </div>;
}
