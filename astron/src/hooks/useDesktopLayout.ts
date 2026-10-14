import { useSyncExternalStore } from 'react';

const query = '(min-width: 1024px)';
function subscribe(notify: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}

// Move the actual navigation too, so keyboard order matches its visible position.
export function useDesktopLayout() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
