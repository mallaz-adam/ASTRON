import type { ArticleCover as Cover } from '../data/types';

export function ArticleCover({ cover, priority = false }: { cover: Cover; priority?: boolean }) {
  return <figure className="article-cover"><img src={cover.src} alt={cover.alt} width="1280" height="1280" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />
    <figcaption><p>{cover.caption}</p><a href={cover.source} target="_blank" rel="noreferrer">{cover.credit}</a><span> · </span><a href={cover.licenseUrl} target="_blank" rel="noreferrer">{cover.license}</a></figcaption>
  </figure>;
}
