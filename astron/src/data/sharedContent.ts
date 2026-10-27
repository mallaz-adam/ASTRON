import { loadContent } from './contentLoader';

// Validated content is immutable. Share one load for this page visit and retry
// failures; publishing a new PWA version reloads the document and this cache.
export function sharedLoader<T>(load: () => Promise<T>) {
  let pending: Promise<T> | undefined;
  return () => pending ??= Promise.resolve().then(load).catch(problem => {
    pending = undefined;
    throw problem;
  });
}
export const getContent = sharedLoader(() => loadContent());
