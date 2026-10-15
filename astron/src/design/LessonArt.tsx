import hook from '/art/lesson-03-hook.svg?raw';
import colours from '/art/lesson-03-colours.svg?raw';
import fuel from '/art/lesson-03-fuel.svg?raw';
import emblems from '/art/lesson-03-emblems.svg?raw';
import star from '/art/star.svg?raw';

const pictures: Record<string, string> = { 'lesson-03-hook': hook, 'lesson-03-colours': colours, 'lesson-03-fuel': fuel, 'lesson-03-emblems': emblems };

export function LessonArt({ name }: { name: string }) {
  return <div className="lesson-picture" dangerouslySetInnerHTML={{ __html: pictures[name] }} />;
}
export function RecapStar() {
  return <span className="inline-art recap-star" aria-hidden="true" dangerouslySetInnerHTML={{ __html: star }} />;
}
