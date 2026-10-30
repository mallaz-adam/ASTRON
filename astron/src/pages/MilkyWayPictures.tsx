import { useState, type ReactNode } from 'react';
import type { MilkyImageId, MilkyScene, MilkyWayUnitData } from '../data/milkyWayUnit';
import { PaintedBody, Plate } from './UnitPictures';
import './MilkyWayUnit.css';

export function MilkyPhoto({ data, id, children, emphasis = false, heading }: { data: MilkyWayUnitData; id: MilkyImageId; children?: ReactNode; emphasis?: boolean; heading?: string }) {
  const image = data.objects.find(item => item.id === id)!;
  return <figure className={`milky-photo${emphasis ? ' milky-photo--emphasis' : ''}`}>
    <h2>{heading ?? image.name}</h2><p className="milky-media-type">{image.mediaType}</p>
    <div className="milky-photo-frame"><img src={image.src} alt={image.alt} width={image.width} height={image.height} decoding="async" />{children}</div>
    <figcaption><p>{image.caption}</p><a href={image.source} target="_blank" rel="noreferrer">{image.credit}</a>
      <div className="milky-license"><a href={image.licenseUrl} target="_blank" rel="noreferrer">{image.license}</a><span>{image.changes}</span></div>
    </figcaption>
  </figure>;
}

function StarPoint({ x, y, halo = 14 }: { x: number; y: number; halo?: number }) {
  return <g><circle cx={x} cy={y} r={halo} fill="#A9C4EE" opacity=".12" /><circle cx={x} cy={y} r={halo * .5} fill="#e9dbbb" opacity=".2" /><circle cx={x} cy={y} r="3" fill="#F3E8CC" /></g>;
}

export function SunAndStar({ data }: { data: MilkyWayUnitData }) {
  return <div className="unit-widget"><div className="milky-sun-pair"><MilkyPhoto data={data} id="sun-visible" />
    <figure className="milky-dot-card"><h2>Another star — seen far away</h2><p className="milky-media-type">Simple illustration</p>
      <svg viewBox="0 0 200 200" role="img" aria-label="A drawn point represents another star seen far away; it is not a size comparison with the Sun."><rect width="200" height="200" fill="#1E2D52" /><StarPoint x={100} y={100} /></svg>
      <figcaption>Both are stars. Both produce their own light.</figcaption>
    </figure>
  </div><p className="unit-caption">Two views; not a size comparison. The distant-star point is an illustration, not a photograph.</p></div>;
}

export function BrightnessComparison() {
  const [factor, setFactor] = useState<'distance' | 'output'>('distance');
  return <div className="unit-widget"><p className="unit-picture-response">Distance matters. Light output matters.</p>
    <div className="unit-switches" role="group" aria-label="Compare brightness factors"><button type="button" aria-pressed={factor === 'distance'} onClick={() => setFactor('distance')}>Distance</button><button type="button" aria-pressed={factor === 'output'} onClick={() => setFactor('output')}>Light output</button></div>
    <Plate description={factor === 'distance' ? 'Two separate example views of the same star. It appears brighter when nearer, fainter when farther away.' : 'Two example stars at the same distance. One produces more light and looks brighter.'}>
      <path d="M210 35V265" stroke="#e9dbbb" opacity=".3" />
      <StarPoint x={112} y={142} halo={32} /><StarPoint x={309} y={142} halo={10} />
      <text x="112" y="208" textAnchor="middle">{factor === 'distance' ? 'Nearer' : 'More light'}</text><text x="309" y="208" textAnchor="middle">{factor === 'distance' ? 'Farther' : 'Less light'}</text>
    </Plate><p className="unit-picture-response" role="status">{factor === 'distance' ? 'The same star, shown at two example distances.' : 'Two example stars at the same distance, producing different amounts of light.'}</p>
    <p className="unit-caption">Schematic; sizes and distances not to scale. The bright spots do not show physical star sizes. A brighter-looking star is not always the nearer one.</p>
  </div>;
}

export function StarDepth() {
  const [sightlines, setSightlines] = useState(false);
  return <div className="unit-widget"><div className="milky-depth-sky"><h2>Seen from Earth</h2>
    <svg viewBox="0 0 420 130" role="img" aria-label="Two stars, A and B, look close together in a simplified sky picture."><StarPoint x={200} y={57} /><StarPoint x={225} y={70} /><text x="170" y="55">A</text><text x="250" y="80">B</text></svg>
  </div><div><h2 className="milky-diagram-heading">Side view: different distances</h2><Plate description="Earth is on the left. Star A is nearer and star B farther away along a nearby direction. The stars do not lie on a flat wall.">
    {sightlines && <g className="milky-sightlines"><path d="M50 150L175 130M50 150L330 130" /></g>}
    <PaintedBody kind="earth" x={50} y={150} r={18} /><StarPoint x={175} y={130} /><StarPoint x={330} y={130} />
    <text x="50" y="202" textAnchor="middle">Earth</text><text x="175" y="98" textAnchor="middle">Star A</text><text x="330" y="98" textAnchor="middle">Star B</text>
    <text x="210" y="253" textAnchor="middle">Different distances</text>
  </Plate></div><button type="button" className="unit-small-button" aria-pressed={sightlines} onClick={() => setSightlines(!sightlines)}>Show sightlines</button>
    <p className="unit-picture-response" role="status">{sightlines ? 'Dashed sightlines show two nearby directions from Earth. The stars have not moved.' : 'Two stars near one another in our sky need not be neighbours in space.'}</p>
    <p className="unit-caption">Schematic; not to scale. A and B are invented examples, not measured star positions. Sightlines show looking directions, not orbits.</p>
  </div>;
}

function SolarGroup() {
  const [grouped, setGrouped] = useState(false);
  return <div className="unit-widget"><Plate description="The Sun and example planets form our solar system. A small moon is next to its planet. Separate stars lie beyond the conceptual grouping.">
    {grouped && <ellipse cx="153" cy="150" rx="125" ry="110" fill="none" stroke="#E8C46A" strokeDasharray="2 5" />}
    <PaintedBody kind="sun" x={113} y={150} r={25} /><PaintedBody kind="earth" x={209} y={112} r={12} /><PaintedBody kind="moon" x={231} y={102} r={4} />
    <circle cx="184" cy="195" r="8" fill="#d9a06e" /><circle cx="78" cy="80" r="6" fill="#c6bfb5" />
    <StarPoint x={351} y={87} /><StarPoint x={350} y={208} />
    <text x="113" y="202" textAnchor="middle">Sun</text><text x="153" y="42" textAnchor="middle">Our solar system</text>
    <text x="335" y="140" textAnchor="middle">Other stars</text><text x="335" y="163" textAnchor="middle">beyond it</text>
  </Plate><button type="button" className="unit-small-button" aria-pressed={grouped} onClick={() => setGrouped(!grouped)}>Show the grouping</button>
    <p className="unit-caption" role={grouped ? 'status' : undefined}>Example planets and moon, not a complete inventory. Schematic; sizes and distances not to scale. A grouping line is not a physical wall. Moons orbit planets.</p>
  </div>;
}

function GalaxyHome() {
  const [found, setFound] = useState(false);
  return <div className="unit-widget"><div className="milky-concept"><h2>Milky Way · many stars</h2>
    <svg viewBox="0 0 420 180" role="img" aria-label="A conceptual star field includes our Sun as one star among many. The marked point links to an example solar-system inset below.">
      {[[38,50],[78,120],[95,40],[140,78],[168,140],[205,36],[240,105],[278,45],[305,136],[350,65],[381,126]].map(([x,y]) => <StarPoint key={x} x={x} y={y} halo={8} />)}
      <circle cx="240" cy="105" r={found ? 22 : 13} fill="none" stroke="#E8C46A" strokeWidth="2" /><text x="240" y="159" textAnchor="middle">Our Sun</text>
    </svg>
  </div><div className={`milky-system-inset${found ? ' milky-system-inset--found' : ''}`}><h2>Our solar system</h2>
    <svg viewBox="0 0 360 125" role="img" aria-label="An inset shows our Sun with an example planet and its moon, as one small system within the galaxy."><PaintedBody kind="sun" x={65} y={48} r={23} /><PaintedBody kind="earth" x={223} y={48} r={13} /><PaintedBody kind="moon" x={250} y={36} r={5} /><text x="65" y="102" textAnchor="middle">Sun</text><text x="230" y="102" textAnchor="middle">Planet + moon</text></svg>
    <p>Our Sun, planets, moons, and smaller objects.</p><p className="unit-caption">One small part of our galaxy. The inset shows examples.</p></div>
    <button type="button" className="unit-small-button" aria-pressed={found} onClick={() => setFound(!found)}>Find the smaller group</button>
    <p className="unit-picture-response" role="status">{found ? 'The outlined star connects to our solar system below.' : 'The galaxy contains many stars, gas, and dust.'}</p>
    <p className="unit-caption">Concept diagram; sizes and distances not to scale. Points are illustrative, not a flat stellar sheet or a map of measured positions. No wall encloses the galaxy.</p>
  </div>;
}

function GalaxyViews({ data }: { data: MilkyWayUnitData }) {
  const [compare, setCompare] = useState(false);
  return <div className="unit-widget"><div className="milky-shape-pair"><MilkyPhoto data={data} id="galaxy-above" emphasis={compare} /><MilkyPhoto data={data} id="galaxy-side" emphasis={compare} /></div>
    <button type="button" className="unit-small-button" aria-pressed={compare} onClick={() => setCompare(!compare)}>Compare the shape</button>
    <p className="unit-picture-response" role="status">{compare ? 'The same broad disk appears in both model views.' : 'Two model views of our galaxy’s broad disk.'}</p><p className="unit-caption">Scientific reconstructions, not photographs. Structure is approximate; this is not a same-scale comparison.</p>
  </div>;
}

function Location({ data }: { data: MilkyWayUnitData }) {
  const [found, setFound] = useState(false);
  return <div className="unit-widget"><MilkyPhoto data={data} id="galaxy-location">
    {found && <svg className="milky-photo-overlay" viewBox="0 0 900 900" aria-hidden="true"><circle cx="476" cy="640" r="26" fill="none" stroke="#E8C46A" strokeWidth="4" /></svg>}
  </MilkyPhoto><button type="button" className="unit-small-button" aria-pressed={found} onClick={() => setFound(!found)}>Find our place</button>
    <p className="unit-picture-response" role="status">{found ? 'The outline highlights the existing arrow’s tip. Our solar system is away from the center.' : 'The bright middle is the galactic center. The original arrow marks our approximate region.'}</p>
    <p className="unit-caption">The location is estimated, not a pinpoint photograph. The source arrow has not moved. Orion Spur is an optional name.</p>
  </div>;
}

function SkyBand({ data }: { data: MilkyWayUnitData }) {
  const [shown, setShown] = useState(false);
  return <div className="unit-widget"><MilkyPhoto data={data} id="panorama">
    {shown && <svg className="milky-photo-overlay" viewBox="0 0 1200 364" aria-hidden="true"><path d="M210 273Q390 75 595 55T1020 231" fill="none" stroke="#E8C46A" strokeWidth="3" strokeDasharray="7 6" /></svg>}
  </MilkyPhoto><button type="button" className="unit-small-button" aria-pressed={shown} onClick={() => setShown(!shown)}>Find the band</button>
    <p className="unit-picture-response" role="status">{shown ? 'The dashed outline follows the broad Milky Way band. We see it from inside the galaxy.' : 'The pale band is our inside view along the star-filled disk.'}</p>
  </div>;
}

export function MilkyViewComparison({ data, interactive = true }: { data: MilkyWayUnitData; interactive?: boolean }) {
  const [connected, setConnected] = useState(false);
  return <div className="unit-widget"><div className="milky-view-pair"><MilkyPhoto data={data} id="galaxy-location" heading="Outside view — reconstruction" emphasis={connected} /><MilkyPhoto data={data} id="panorama" heading="From Earth — photograph" emphasis={connected} /></div>
    <p className="unit-picture-response" role={interactive ? 'status' : undefined}>{connected ? 'The source marker shows our approximate region, where Earth’s inside view begins.' : 'One galaxy, two kinds of pictures. We are inside the Milky Way.'}</p>
    {interactive && <button type="button" className="unit-small-button" aria-pressed={connected} onClick={() => setConnected(!connected)}>Connect the views</button>}
    <p className="unit-caption">Outside reconstruction and Earth photograph. No outside photograph or scale-accurate journey is shown.</p>
  </div>;
}

export function MilkyWayPicture({ data, scene }: { data: MilkyWayUnitData; scene: MilkyScene }) {
  if (scene === 'night-sky') return <MilkyPhoto data={data} id="sky" />;
  if (scene === 'sun-star') return <SunAndStar data={data} />;
  if (scene === 'brightness') return <BrightnessComparison />;
  if (scene === 'star-depth') return <StarDepth />;
  if (scene === 'solar-group') return <SolarGroup />;
  if (scene === 'galactic-home') return <GalaxyHome />;
  if (scene === 'galaxy-views') return <GalaxyViews data={data} />;
  if (scene === 'our-location') return <Location data={data} />;
  if (scene === 'sky-band') return <SkyBand data={data} />;
  return <MilkyViewComparison data={data} />;
}
