import { useState, type ReactNode } from 'react';
import type { GalaxiesUnitData, GalaxyImageId, GalaxyScene } from '../data/galaxiesUnit';
import './GalaxiesUnit.css';

export function GalaxyPhoto({ data, id, children }: { data: GalaxiesUnitData; id: GalaxyImageId; children?: ReactNode }) {
  const image = data.objects.find(item => item.id === id)!;
  return <figure className="galaxy-photo">
    <h2>{image.name}</h2><p className="galaxy-media-type">{image.mediaType}</p>
    <div className="galaxy-photo-frame"><img src={image.src} width={image.width} height={image.height} alt={image.alt} decoding="async" />{children}</div>
    <figcaption><p>{image.caption}</p><a href={image.source} target="_blank" rel="noreferrer">{image.credit}</a>
      <div className="galaxy-license"><a href={image.licenseUrl} target="_blank" rel="noreferrer">{image.license}</a><span>{image.changes}</span></div>
    </figcaption>
  </figure>;
}

const homes = [
  { name: 'Earth', text: 'Our planet travels around the Sun.' },
  { name: 'Our solar system', text: 'The Sun, planets, moons and smaller objects.' },
  { name: 'Milky Way galaxy', text: 'Our solar system is one small part of this galaxy.' },
  { name: 'Universe', text: 'Our galaxy, other galaxies, and all the space between them belong to the universe.' },
];

export function GalaxyHomeMap({ interactive = true }: { interactive?: boolean }) {
  const [selected, setSelected] = useState(0);
  return <div className="unit-widget galaxy-home-map"><h2>A home within a wider home</h2>
    <ol className="galaxy-homes">{homes.map((home, index) => <li key={home.name}>
      {interactive ? <button type="button" aria-pressed={index === selected} onClick={() => setSelected(index)}><span>{home.name}</span><small>{home.text}</small></button>
        : <div><span>{home.name}</span><small>{home.text}</small></div>}
    </li>)}</ol>
    {interactive && <><div className="unit-switches"><button type="button" disabled={selected === 0} onClick={() => setSelected(selected - 1)}>Previous home</button><button type="button" disabled={selected === homes.length - 1} onClick={() => setSelected(selected + 1)}>Next home</button></div><p className="unit-picture-response" role="status">{homes[selected].name}: {homes[selected].text}</p></>}
    <p className="unit-caption">Relationship diagram, not to scale. The lines connect ideas; they are not physical borders.</p>
  </div>;
}

const materialNotes = {
  stars: 'Stars produce light. Many have their own planets.',
  gas: 'Gas lies between the stars, often spread very thinly.',
  dust: 'Small solid grains can block some starlight.',
};

export function GalaxyMaterials({ gravity = false }: { gravity?: boolean }) {
  const [material, setMaterial] = useState<keyof typeof materialNotes>('stars');
  return <div className="unit-widget"><h2>{gravity ? 'One connected galaxy' : 'Stars, gas and dust'}</h2>
    <div className="unit-switches" role="group" aria-label="Explore galaxy material">{(['stars', 'gas', 'dust'] as const).map(key => <button type="button" key={key} aria-pressed={material === key} onClick={() => setMaterial(key)}>{key === 'stars' ? 'Stars' : key === 'gas' ? 'Gas' : 'Dust'}</button>)}</div>
    <svg className="galaxy-plate" viewBox="0 0 420 250" role="img" aria-label="A schematic galaxy contains star points, diffuse gas and narrow dust lanes. These materials overlap; the colours do not represent measured colours.">
      <rect width="420" height="250" fill="#1E2D52" />
      <g opacity={material === 'gas' ? .7 : .25} fill="none" stroke="#A9C4EE" strokeWidth="26"><path d="M210 125C320 12 403 153 280 195S38 144 115 56" /><path d="M210 125C100 225 15 86 140 49S367 95 302 187" /></g>
      <g opacity={material === 'dust' ? 1 : .6} fill="none" stroke="#101727" strokeWidth={material === 'dust' ? 12 : 8}><path d="M207 129C301 23 382 154 269 182" /><path d="M207 126C124 214 42 96 147 62" /></g>
      <g fill="#F3E8CC">{Array.from({ length: 48 }, (_, i) => { const angle = i * 2.4; const radius = 14 + i * 2.1; return <circle key={i} cx={210 + Math.cos(angle) * radius * 1.45} cy={125 + Math.sin(angle) * radius * .8} r={material === 'stars' ? 2.3 : 1.6} />; })}</g>
      <ellipse cx="210" cy="125" rx="22" ry="15" fill="#F0D9A8" opacity=".8" />
    </svg>
    <p className="unit-picture-response" role="status">{materialNotes[material]}</p>
    {gravity && <p>Gravity links these objects and helps hold the galaxy together. Our solar system belongs to this much larger system.</p>}
    <p className="unit-caption">Concept model, not to scale. Materials overlap. Colours and positions illustrate ideas, not measured locations.</p>
  </div>;
}

export function GalaxyShapes({ data }: { data: GalaxiesUnitData }) {
  const [compared, setCompared] = useState(false);
  return <div className="unit-widget"><button type="button" className="unit-small-button" aria-pressed={compared} onClick={() => setCompared(!compared)}>Compare appearances</button>
    <p className="unit-picture-response" role="status">{compared ? 'M51 has curving arms. IC 2006 looks smoother and roughly oval.' : 'Two observed galaxies, with different appearances.'}</p>
    <div className={`galaxy-pair${compared ? ' galaxy-pair--compared' : ''}`}><GalaxyPhoto data={data} id="m51" /><GalaxyPhoto data={data} id="ic-2006" /></div>
    <p className="unit-caption">Equal panel sizes are a layout choice, not a comparison of the galaxies' real sizes. Viewpoint also affects appearance.</p>
  </div>;
}

type Feature = 'centre' | 'arms' | 'dust';
const featureNotes: Record<Feature, string> = {
  centre: 'The outline marks M51’s bright middle. The drawing simplifies it.',
  arms: 'One star-filled curved region is outlined. Arms are broad regions, not rigid lines.',
  dust: 'The outline marks part of a dark dust lane. Dust blocks some starlight.',
};

function SpiralModel({ feature }: { feature: Feature }) {
  return <figure className="galaxy-model"><h2>Explanatory diagram</h2><p className="galaxy-media-type">Original ASTRON illustration · not to scale</p>
    <svg className="galaxy-plate" viewBox="0 0 420 300" role="img" aria-label={`A simplified spiral galaxy highlights its ${feature}. The drawing is not a second observation or a map of every star.`}>
      <rect width="420" height="300" fill="#1E2D52" />
      <g stroke={feature === 'arms' ? '#E8C46A' : '#A9C4EE'} strokeWidth="20" fill="none" opacity=".6"><path d="M210 145C290 42 375 105 333 180S154 251 105 180" /><path d="M210 145C130 242 45 179 87 104S266 33 315 104" /></g>
      <path d="M210 145C271 66 346 110 316 165" stroke={feature === 'dust' ? '#E8C46A' : '#101727'} strokeWidth="7" fill="none" />
      <ellipse cx="210" cy="145" rx="30" ry="21" fill="#F0D9A8" />
      {feature === 'centre' && <ellipse cx="210" cy="145" rx="45" ry="36" fill="none" stroke="#E8C46A" strokeWidth="3" />}
    </svg><figcaption>Selected features are simplified. This drawing does not reproduce every star, colour or detail.</figcaption>
  </figure>;
}

export function GalaxyObservation({ data }: { data: GalaxiesUnitData }) {
  const [feature, setFeature] = useState<Feature>('centre');
  return <div className="unit-widget"><div className="unit-switches" role="group" aria-label="Compare a feature in the observation and diagram">{(['centre', 'arms', 'dust'] as const).map(key => <button type="button" key={key} aria-pressed={feature === key} onClick={() => setFeature(key)}>{key === 'centre' ? 'Bright centre' : key === 'arms' ? 'Spiral arms' : 'Dust lane'}</button>)}</div>
    <p className="unit-picture-response" role="status">{featureNotes[feature]}</p>
    <div className="galaxy-pair"><GalaxyPhoto data={data} id="m51"><svg className="galaxy-feature-overlay" viewBox="0 0 1000 694" aria-hidden="true">
      {feature === 'centre' ? <ellipse cx="385" cy="334" rx="62" ry="54" /> : feature === 'arms' ? <ellipse cx="299" cy="100" rx="186" ry="55" /> : <ellipse cx="465" cy="255" rx="56" ry="24" transform="rotate(34 465 255)" />}
    </svg></GalaxyPhoto><SpiralModel feature={feature} /></div>
    <p className="unit-caption">The gold outline is an ASTRON teaching annotation. It marks an example region, not a measured boundary. The observation uses real telescope data; the diagram explains selected features.</p>
  </div>;
}

export function GalaxyReconstruction({ data }: { data: GalaxiesUnitData }) {
  return <div className="unit-widget"><GalaxyPhoto data={data} id="milky-model" /><p className="unit-picture-response">An evidence-guided outside view. Some details remain uncertain; this is not an outside photograph.</p></div>;
}

export function GalaxyUniverse({ limits = false }: { limits?: boolean }) {
  const [open, setOpen] = useState(false);
  return <div className="unit-widget"><div className="galaxy-universe"><h2>Both belong to the universe</h2>
    <div className="galaxy-examples">{['Milky Way', 'Andromeda'].map(name => <div key={name}><svg viewBox="0 0 160 110" role="img" aria-label={`${name}, shown as a schematic example, not a photograph.`}><ellipse cx="80" cy="54" rx="55" ry="25" fill="#A9C4EE" opacity=".2" /><path d="M80 54C130 4 151 83 70 85S15 12 89 29" fill="none" stroke="#F3E8CC" strokeWidth="3" /><ellipse cx="80" cy="54" rx="12" ry="8" fill="#F0D9A8" /></svg><p>{name}</p></div>)}</div>
    <p>Other galaxies and the space between them also belong to the universe.</p></div>
    <p className="unit-caption">Relationship diagram, not to scale. Two examples, not a complete map or a physical edge.</p>
    {limits && <><p>Our observable region is a limit to what can reach us, not a wall around everything.</p><button type="button" className="unit-small-button" aria-expanded={open} aria-controls="galaxy-map-limit" onClick={() => setOpen(!open)}>What can this drawing tell us?</button>
      {open && <p id="galaxy-map-limit" className="unit-picture-response">It connects ideas. It cannot show the whole universe, its full extent or a physical edge.</p>}</>}
  </div>;
}

export function GalaxiesPicture({ data, scene }: { data: GalaxiesUnitData; scene: GalaxyScene }) {
  if (scene === 'home') return <GalaxyHomeMap />;
  if (scene === 'contents' || scene === 'gravity') return <GalaxyMaterials gravity={scene === 'gravity'} />;
  if (scene === 'beyond') return <GalaxyPhoto data={data} id="deep-field" />;
  if (scene === 'andromeda') return <GalaxyPhoto data={data} id="andromeda" />;
  if (scene === 'shapes') return <GalaxyShapes data={data} />;
  if (scene === 'observation') return <GalaxyObservation data={data} />;
  if (scene === 'reconstruction') return <GalaxyReconstruction data={data} />;
  return <GalaxyUniverse limits={scene === 'observable'} />;
}
