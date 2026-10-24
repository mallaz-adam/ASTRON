export function shouldOfferUpdate(hasController: boolean, hasWaitingWorker: boolean) {
  return hasController && hasWaitingWorker;
}

// The first install has no controlling worker. Only a later waiting worker
// offers REFRESH; activation happens after the learner presses it.
export async function observeUpdates(workers: ServiceWorkerContainer, ready: (refresh: () => void) => void, reload: () => void) {
  const registration = await workers.register('/sw.js', { scope: '/', updateViaCache: 'none' });
  let refreshRequested = false;
  let disposed = false;
  const watched = new Set<ServiceWorker>();
  const listeners = new Map<ServiceWorker, () => void>();
  function offer() {
    if (!disposed && shouldOfferUpdate(Boolean(workers.controller), Boolean(registration.waiting))) {
      ready(() => {
        refreshRequested = true;
        if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        else reload(); // Another open tab may already have activated it.
      });
    }
  }
  function watchInstalling() {
    const worker = registration.installing;
    if (!worker || watched.has(worker)) return;
    watched.add(worker);
    const changed = () => { if (worker.state === 'installed') offer(); };
    listeners.set(worker, changed);
    worker.addEventListener('statechange', changed);
  }
  const controlling = () => { if (refreshRequested && !disposed) { refreshRequested = false; reload(); } };
  workers.addEventListener('controllerchange', controlling);
  registration.addEventListener('updatefound', watchInstalling);
  watchInstalling();
  offer();
  return {
    check: async () => { if (!disposed && !registration.installing) await registration.update().catch(() => {}); },
    dispose: () => {
      disposed = true;
      workers.removeEventListener('controllerchange', controlling);
      registration.removeEventListener('updatefound', watchInstalling);
      for (const [worker, listener] of listeners) worker.removeEventListener('statechange', listener);
    },
  };
}
