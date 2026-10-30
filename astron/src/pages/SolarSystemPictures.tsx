import { useState } from 'react';
import { planetIds, type PlanetId, type SolarImage, type SolarImageId, type SolarScene, type SolarSystemUnitData } from '../data/solarSystemUnit';
import { PaintedBody, Plate } from './UnitPictures';
import './SolarSystemUnit.css';

function picture(data: SolarSystemUnitData, id: SolarImageId) { return data.objects.find(item => item.id === id)!; }

export function PlanetOrder({ data, innerOnly = false, interactive = true }: { data: SolarSystemUnitData; innerOnly?: boolean; interactive?: boolean }) {
  const [selected, setSelected] = useState<PlanetId>();
  const ids = innerOnly ? planetIds.slice(0, 4) : planetIds;
  return <div className="solar-order-wrap"><p className="solar-label">From the Sun</p>
    <ol className="solar-order">{ids.map((id, index) => {
      const image = picture(data, id);
      const contents = <><span className="solar-position" aria-hidden="true">{index + 1}</span><img src={image.src} alt="" width="100" height="82" decoding="async" /><span>{image.name}</span></>;
      return <li key={id}>{interactive ? <button type="button" aria-label={`${image.name}, ${index + 1} from the Sun`} aria-pressed={selected === id} onClick={() => setSelected(id)}>{contents}</button> : <div>{contents}</div>}</li>;
    })}</ol>
    {selected && <p className="unit-picture-response" role="status">{picture(data, selected).name}: {picture(data, selected).clue}</p>}
    <p className="unit-caption">Order only — not to scale. These are separate observed views, not their positions today.</p>
  </div>;
}

export function SolarFamily({ data, interactive = true }: { data: SolarSystemUnitData; interactive?: boolean }) {
  const [selected, setSelected] = useState('');
  const groups = [
    { id: 'planets', name: 'Planets', detail: 'Eight planets orbit the Sun.', image: 'earth' as const },
    { id: 'moons', name: 'Moons', detail: 'Moons orbit planets and other worlds.', image: 'moon' as const },
    { id: 'smaller', name: 'Other worlds', detail: 'Asteroids, comets and dwarf planets belong here too.', image: 'pluto' as const },
  ];
  return <div className="solar-family"><div className="solar-family-sun"><img src={picture(data, 'sun').src} alt="Processed spacecraft view of the Sun, our solar system’s star." width="76" height="76" /><span>Sun · our star</span></div>
    <div className="solar-family-branches" aria-hidden="true" />
    <div className="solar-family-groups">{groups.map(group => <div key={group.id}>
      {interactive ? <button type="button" aria-pressed={selected === group.id} onClick={() => setSelected(group.id)}><img src={picture(data, group.image).src} alt="" width="54" height="54" /><span>{group.name}</span></button>
        : <div><img src={picture(data, group.image).src} alt="" width="54" height="54" /><span>{group.name}</span></div>}
    </div>)}</div>
    <p className="solar-family-detail" role={interactive ? 'status' : undefined}>{groups.find(g => g.id === selected)?.detail ?? 'All belong to our solar system.'}</p>
    <p className="solar-family-caption">Concept map — not to scale. Lines show connections, not orbits. Pictures include processed observations.</p>
  </div>;
}

function MediaNote({ image }: { image: SolarImage }) {
  return <div className="solar-media-note"><p>{image.caption}</p><a href={image.source} target="_blank" rel="noreferrer">{image.credit}</a>{image.license && <p>{image.license}</p>}</div>;
}

function PictureTiles({ data, ids, highlighted = [] }: { data: SolarSystemUnitData; ids: readonly SolarImageId[]; highlighted?: readonly SolarImageId[] }) {
  const [selected, setSelected] = useState<SolarImageId>();
  return <div className="unit-widget"><div className="solar-picture-tiles">{ids.map(id => {
    const image = picture(data, id);
    return <figure key={id} className={highlighted.includes(id) ? 'solar-tile--highlighted' : ''}>
      <button type="button" aria-label={`Picture details: ${image.name}`} aria-expanded={selected === id} onClick={() => setSelected(selected === id ? undefined : id)}>
        <img src={image.src} alt={image.alt} width="300" height="240" decoding="async" /><span>{image.name}</span>
      </button><figcaption>{image.clue}</figcaption>
    </figure>;
  })}</div>
    {selected && <MediaNote image={picture(data, selected)} />}
    <p className="unit-caption">Separate observed views — not to scale. Some colours are processed. Choose a picture for its source and image details.</p>
  </div>;
}

function LightMaker({ data }: { data: SolarSystemUnitData }) {
  const [shown, setShown] = useState(false);
  return <div className="unit-widget"><PictureTiles data={data} ids={['sun', 'earth']} highlighted={shown ? ['sun'] : []} />
    <button type="button" className="unit-small-button" aria-pressed={shown} onClick={() => setShown(!shown)}>Find the light-maker</button>
    <p className="unit-picture-response" role="status">The Sun makes light. Earth reflects some sunlight.</p>
  </div>;
}

function RockyWorlds({ data }: { data: SolarSystemUnitData }) {
  const [compare, setCompare] = useState(false);
  return <div className="unit-widget"><PictureTiles data={data} ids={planetIds.slice(0, 4)} highlighted={compare ? ['earth', 'mars'] : []} />
    <button type="button" className="unit-small-button" aria-pressed={compare} onClick={() => setCompare(!compare)}>Compare worlds</button>
    <p className="unit-picture-response" role="status">Earth: visible oceans. Mars: reddish surface. Venus’s rocky ground is hidden beneath clouds.</p>
  </div>;
}

function GiantWorlds({ data }: { data: SolarSystemUnitData }) {
  const [ice, setIce] = useState(false);
  return <div className="unit-widget"><div className="unit-switches" role="group" aria-label="Compare giant planet groups">
    <button type="button" aria-pressed={!ice} onClick={() => setIce(false)}>Gas giants</button><button type="button" aria-pressed={ice} onClick={() => setIce(true)}>Ice giants</button>
  </div><PictureTiles data={data} ids={planetIds.slice(4)} highlighted={ice ? ['uranus', 'neptune'] : ['jupiter', 'saturn']} />
    <p className="unit-picture-response" role="status">{ice ? 'Uranus and Neptune are ice giants. The name does not mean icy ground.' : 'Jupiter and Saturn are gas giants. They have no Earth-like solid ground.'}</p>
  </div>;
}

function GiantDetails({ data }: { data: SolarSystemUnitData }) {
  const [rings, setRings] = useState(false);
  const image = picture(data, rings ? 'saturn' : 'jupiter');
  return <div className="unit-widget"><div className="unit-switches" role="group" aria-label="Explore giant planet details">
    <button type="button" aria-pressed={!rings} onClick={() => setRings(false)}>Cloud bands</button><button type="button" aria-pressed={rings} onClick={() => setRings(true)}>Rings</button>
  </div><figure className="solar-detail-photo"><img src={image.src} alt={image.alt} width="600" height={rings ? 354 : 338} decoding="async" /><figcaption>{image.name}</figcaption></figure>
    <p className="unit-picture-response" role="status">{image.clue}</p><MediaNote image={image} />
    <p className="unit-caption">Separate view — not to scale. Saturn is not the only planet with rings. Processing affects colours and brightness.</p>
  </div>;
}

function MoonPaths() {
  const [shown, setShown] = useState(false);
  return <div className="unit-widget"><Plate description="Two separate close views show our Moon orbiting Earth and three example moons around Jupiter. The Jupiter drawing is not a complete moon count.">
    <path d="M210 35v225" stroke="#e9dbbb" opacity=".25" />
    <PaintedBody kind="earth" x={110} y={148} r={27} />
    <circle cx="310" cy="148" r="31" fill="#c69f79" stroke="#f0d9a8" /><path d="M283 136q27 10 54 0m-57 14q30 9 60-1m-55 11q25 5 50-2" fill="none" stroke="#856d5a" strokeWidth="5" />
    {shown && <><circle cx="110" cy="148" r="64" className="solar-orbit" /><circle cx="310" cy="148" r="55" className="solar-orbit" /><circle cx="310" cy="148" r="78" className="solar-orbit" /></>}
    <PaintedBody kind="moon" x={110} y={84} r={9} /><PaintedBody kind="moon" x={310} y={93} r={7} /><PaintedBody kind="moon" x={255} y={148} r={6} /><PaintedBody kind="moon" x={310} y={226} r={7} />
    <text x="110" y="193" textAnchor="middle">Earth</text><text x="310" y="195" textAnchor="middle">Jupiter</text>
    <text x="110" y="58" textAnchor="middle">Our Moon</text><text x="310" y="58" textAnchor="middle">Example moons</text>
  </Plate><button type="button" className="unit-small-button" aria-pressed={shown} onClick={() => setShown(!shown)}>Show moon paths</button>
    <p className="unit-picture-response">Moons orbit their planets; planets orbit the Sun. Mercury and Venus have no moons.</p>
    <p className="unit-caption">Separate close views — not to scale. Jupiter’s moons are examples, not a complete count. Dashed lines show orbits, not physical tracks.</p>
  </div>;
}

function SmallWorlds({ data }: { data: SolarSystemUnitData }) {
  const [near, setNear] = useState(true);
  const x = near ? 182 : 306;
  return <div className="unit-widget"><PictureTiles data={data} ids={['asteroid', 'comet']} />
    <Plate description={near ? 'A schematic comet near the Sun has a tail pointing away from the Sun. The tail is an illustration, separate from the real comet close-up.' : 'A schematic comet farther from the Sun is shown without a visible tail.'}>
      <PaintedBody kind="sun" x={65} y={145} r={29} /><text x="65" y="210" textAnchor="middle">Sun</text>
      {near && <><path d="M190 140Q255 110 355 92Q285 155 190 151Z" fill="#accce3" opacity=".35" /><path d="M193 145L359 145" stroke="#cee5f4" className="unit-arrow" /></>}
      <PaintedBody kind="moon" x={x} y={145} r={12} /><text x={x} y="193" textAnchor="middle">Comet</text>
      <text x="210" y="258" textAnchor="middle">{near ? 'Tail away from the Sun' : 'No visible tail here'}</text>
    </Plate><div className="unit-switches" role="group" aria-label="Compare a comet near and far from the Sun"><button type="button" aria-pressed={near} onClick={() => setNear(true)}>Nearer the Sun</button><button type="button" aria-pressed={!near} onClick={() => setNear(false)}>Farther from the Sun</button></div>
    <p className="unit-picture-response" role="status">{near ? 'Some comets form tails near the Sun. Their tails generally point away from it.' : 'A comet does not always have a visible tail.'}</p>
    <p className="unit-caption">Tail illustration — not to scale. It has not been added to the spacecraft picture.</p>
  </div>;
}

function Pluto({ data }: { data: SolarSystemUnitData }) {
  const [more, setMore] = useState(false);
  return <div className="unit-widget"><PictureTiles data={data} ids={['pluto']} />
    <div className="solar-pluto-identity"><p>Part of our solar system: yes.</p><p>One of the eight planets: no.</p><p>Its group: dwarf planet.</p></div>
    <button type="button" className="unit-small-button" aria-expanded={more} aria-controls="pluto-classification" onClick={() => setMore(!more)}>Why a different group? (optional)</button>
    {more && <div id="pluto-classification" className="unit-definition">{data.plutoDetail.map(p => <p key={p}>{p}</p>)}</div>}
  </div>;
}

export function SolarSystemPicture({ scene, data }: { scene: SolarScene; data: SolarSystemUnitData }) {
  if (scene === 'family' || scene === 'solar-recap') return <SolarFamily data={data} />;
  if (scene === 'light-maker') return <LightMaker data={data} />;
  if (scene === 'planet-order') return <PlanetOrder data={data} />;
  if (scene === 'rocky-worlds') return <RockyWorlds data={data} />;
  if (scene === 'giant-worlds') return <GiantWorlds data={data} />;
  if (scene === 'giant-details') return <GiantDetails data={data} />;
  if (scene === 'other-moons') return <MoonPaths />;
  if (scene === 'small-worlds') return <SmallWorlds data={data} />;
  return <Pluto data={data} />;
}
