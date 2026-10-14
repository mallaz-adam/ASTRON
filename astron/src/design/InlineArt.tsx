import sun0 from '/art/sun-stage-0.svg?raw';
import sun1 from '/art/sun-stage-1.svg?raw';
import sun2 from '/art/sun-stage-2.svg?raw';
import sun3 from '/art/sun-stage-3.svg?raw';
import happyOwl from '/art/glaux-happy.svg?raw';
import './art.css';

const suns = [sun0, sun1, sun2, sun3];

// Only these supplied, static SVG files are inserted. Content JSON never becomes HTML.
export function SunArt({ stage }: { stage: 0 | 1 | 2 | 3 }) {
  return <span className="inline-art today-sun" dangerouslySetInnerHTML={{ __html: suns[stage] }} />;
}

export function GlauxArt() {
  return <span className="inline-art today-glaux" dangerouslySetInnerHTML={{ __html: happyOwl }} />;
}
