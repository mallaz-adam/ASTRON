import { useState } from 'react';
import type { ExplorationSection } from '../data/explorationLesson';
import { modelAtSunWidth } from '../logic/lessonExam';

const levels = ['Earth', 'Solar system', 'Milky Way', 'Universe'];
const descriptions = ['Our planet travels around the Sun.', 'Our Sun, its planets, moons and smaller objects.', 'Our galaxy contains our whole solar system and billions of stars.', 'The wider view contains many galaxies, including the Milky Way.'];
const decimal = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });

function CosmicPicture({ level }: { level: number }) {
  return <svg viewBox="0 0 340 220" role="img" aria-label={`${levels[level]}. A concept diagram, not to scale.`}>
    <rect x="1" y="1" width="338" height="218" fill="var(--lapis)" stroke="var(--gold)" strokeDasharray="2 5" />
    {Array.from({ length: 32 }, (_, i) => <circle key={i} cx={12 + (i * 97 % 316)} cy={12 + (i * 71 % 196)} r={i % 4 === 0 ? 1.4 : .7} fill="var(--parchment)" opacity=".6" />)}
    {level === 0 && <g><circle cx="170" cy="108" r="62" fill="#2F4A7A" /><path d="M134 65q36-12 49 9l-16 22 25 12-5 32-28 10-13-32-26-18Z" fill="#7B9577" /><circle cx="170" cy="108" r="69" fill="none" stroke="#A9C4EE" opacity=".25" /></g>}
    {level === 1 && <g>{[35, 57, 79, 101].map(r => <ellipse key={r} cx="170" cy="110" rx={r * 1.4} ry={r * .65} fill="none" stroke="var(--parchment)" opacity=".25" />)}<circle cx="170" cy="110" r="19" fill="var(--gold-light)" opacity=".16" /><circle cx="170" cy="110" r="12" fill="var(--gold-light)" />{[35,57,79,101].map((r,i)=><circle key={r} cx={170+r*1.2} cy={110-r*.33} r={i+2} fill={i===1?'#A9C4EE':'var(--parchment)'} />)}</g>}
    {level === 2 && <g transform="translate(170 110)"><ellipse rx="128" ry="67" fill="var(--parchment)" opacity=".05" />{[0,90,180,270].map(a=><path key={a} d="M0 0C55-45 114-22 110 25C100 58 32 66-15 38" transform={`rotate(${a}) scale(1 .7)`} fill="none" stroke="var(--parchment)" strokeWidth="9" opacity=".13" />)}<ellipse rx="17" ry="12" fill="var(--gold-light)" opacity=".6" /><circle cx="70" cy="20" r="5" fill="#A9C4EE" /><path d="M75 25l20 24" stroke="#A9C4EE" /><text x="92" y="63" fill="var(--parchment)" fontSize="13" textAnchor="end">Our solar system</text></g>}
    {level === 3 && <g>{Array.from({length:8},(_,i)=><g key={i} transform={`translate(${45+(i%4)*83} ${65+Math.floor(i/4)*96}) rotate(${i*31})`}><ellipse rx="25" ry="10" fill="var(--parchment)" opacity=".15" /><ellipse rx="16" ry="4" fill="var(--gold-light)" opacity=".6" /><circle r="3" fill="var(--parchment)" /></g>)}</g>}
  </svg>;
}

function AddressExplorer({ initial = 0 }: { initial?: number }) {
  const [level, setLevel] = useState(initial);
  return <div className="exploration-widget"><div className="exploration-levels" role="group" aria-label="Explore our cosmic address">{levels.map((label,i)=><button key={label} type="button" aria-pressed={level===i} onClick={()=>setLevel(i)}>{label}</button>)}</div><CosmicPicture level={level} /><p role="status">{descriptions[level]}</p><p className="exploration-note">Concept diagram. Sizes, gaps and location markers are simplified.</p></div>;
}

function ScaleModel() {
  const [sun, setSun] = useState(10);
  const model = modelAtSunWidth(sun);
  const number = (value: number, digits = 1) => (digits ? decimal : whole).format(value);
  return <div className="exploration-widget">
    <svg viewBox="0 0 340 170" role="img" aria-label="The model Sun and Earth compared in width. The gap is shortened.">
      <rect x="1" y="1" width="338" height="168" fill="var(--lapis)" stroke="var(--gold)" strokeDasharray="2 5" />
      <circle cx="95" cy="78" r={sun*3+7} fill="var(--gold-light)" opacity=".15" /><circle cx="95" cy="78" r={sun*3} fill="var(--gold-light)" />
      <circle cx="253" cy="78" r={sun*3/109.375} fill="#A9C4EE" /><path d="M253 82v31" stroke="var(--parchment)" /><text x="95" y="150" textAnchor="middle" fill="var(--parchment)" fontSize="16">Sun</text><text x="253" y="136" textAnchor="middle" fill="var(--parchment)" fontSize="16">Earth</text>
    </svg>
    <label className="exploration-slider">Model Sun: {sun} cm wide<input type="range" min="5" max="20" step="1" value={sun} aria-valuetext={`${sun} centimetres wide`} onChange={e=>setSun(Number(e.target.value))} /></label>
    <dl className="exploration-measures" aria-live="polite"><div><dt>Earth’s width</dt><dd>About {number(model.earthMm)} mm</dd></div><div><dt>Earth’s distance from the Sun</dt><dd>About {number(model.earthM)} m</dd></div><div><dt>Neptune’s distance from the Sun</dt><dd>About {number(model.neptuneM,0)} m</dd></div></dl>
    <p className="exploration-note">Calculated from NASA measurements. Rounded values; distances use average orbital distances. The picture compares widths, with the gap shortened.</p>
  </div>;
}

function PictureComparison() {
  const [distance, setDistance] = useState(false);
  return <div className="exploration-widget"><div className="exploration-levels" role="group" aria-label="Choose a comparison"><button type="button" aria-pressed={!distance} onClick={()=>setDistance(false)}>Compare sizes</button><button type="button" aria-pressed={distance} onClick={()=>setDistance(true)}>Compare distances</button></div>
    <svg viewBox="0 0 340 180" role="img" aria-label={distance?'Average distances from the Sun to Earth and Neptune. Location markers are enlarged.':'The Sun and Earth compared in width. The gap is shortened.'}>
      <rect x="1" y="1" width="338" height="178" fill="var(--lapis)" stroke="var(--gold)" strokeDasharray="2 5" />
      {distance ? <g><path d="M25 70h270" stroke="var(--parchment)" opacity=".6" /><circle cx="25" cy="70" r="7" fill="var(--gold-light)" /><circle cx="34" cy="70" r="3" fill="#A9C4EE" /><circle cx="295" cy="70" r="5" fill="#A9C4EE" /><path d="M25 80v34M34 77l30 57M295 79v38" stroke="var(--parchment)" opacity=".6" /><text x="15" y="132" fill="var(--parchment)" fontSize="15">Sun</text><text x="65" y="153" fill="var(--parchment)" fontSize="15">Earth</text><text x="295" y="139" textAnchor="middle" fill="var(--parchment)" fontSize="15">Neptune</text></g> : <g><circle cx="95" cy="80" r="54" fill="var(--gold-light)" /><circle cx="255" cy="80" r={54/109.375} fill="#A9C4EE" /><path d="M255 85v35" stroke="var(--parchment)" /><text x="95" y="157" textAnchor="middle" fill="var(--parchment)" fontSize="16">Sun</text><text x="255" y="147" textAnchor="middle" fill="var(--parchment)" fontSize="16">Earth</text></g>}
    </svg><p role="status">{distance?'Average distances share a scale. Location markers are enlarged.':'Relative widths share a scale. The gap is shortened.'}</p><p className="exploration-note">The straight line compares distances. Planets orbit the Sun.</p></div>;
}

export function ExplorationDiagram({ kind }: { kind: ExplorationSection['diagram'] }) {
  if (kind==='scale') return <ScaleModel />;
  if (kind==='models') return <PictureComparison />;
  if (kind==='neighbour') return <div className="exploration-widget"><svg viewBox="0 0 340 150" role="img" aria-label="At a model Sun width of 10 centimetres, the nearest other star is roughly 3,000 kilometres away. The gap in this picture is compressed."><rect x="1" y="1" width="338" height="148" fill="var(--lapis)" stroke="var(--gold)" strokeDasharray="2 5" /><circle cx="30" cy="60" r="9" fill="var(--gold-light)" /><circle cx="310" cy="60" r="6" fill="#D9735A" /><path d="M45 60h100l10-12 16 24 12-12h113" fill="none" stroke="var(--parchment)" opacity=".6" /><text x="170" y="112" textAnchor="middle" fill="var(--parchment)" fontSize="19">Roughly 3,000 km</text></svg><p className="exploration-note">Same 10 cm model Sun. The gap is compressed to fit this picture.</p></div>;
  return <AddressExplorer initial={kind==='sun'?1:kind==='galaxy'?2:kind==='universe'?3:0} />;
}
