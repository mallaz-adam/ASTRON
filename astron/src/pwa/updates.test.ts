import { describe, expect, it, vi } from 'vitest';
import { observeUpdates, shouldOfferUpdate } from './updates';

class Worker extends EventTarget {
  state = 'installing';
  postMessage = vi.fn();
}
class Registration extends EventTarget {
  waiting: Worker | null = null;
  installing: Worker | null = null;
  update = vi.fn(async () => {});
  installed(worker: Worker) {
    this.waiting = worker; this.installing = null; worker.state = 'installed';
    worker.dispatchEvent(new Event('statechange'));
  }
}
class Workers extends EventTarget {
  controller: Worker | null = null;
  registration = new Registration();
  register = vi.fn(async () => this.registration);
  get api() { return this as unknown as ServiceWorkerContainer; }
}

describe('Installed app updates', () => {
  it.each([[false, false, false], [false, true, false], [true, false, false], [true, true, true]])('offers an update for controller=%s, waiting=%s', (controller, waiting, expected) => {
    expect(shouldOfferUpdate(controller, waiting)).toBe(expected);
  });
  it('never shows an update on the first install', async () => {
    const workers = new Workers(); const first = new Worker();
    workers.registration.installing = first;
    const ready = vi.fn(); const reload = vi.fn();
    const observer = await observeUpdates(workers.api, ready, reload);
    workers.registration.installed(first);
    workers.controller = first;
    workers.dispatchEvent(new Event('controllerchange'));
    expect(ready).not.toHaveBeenCalled(); expect(reload).not.toHaveBeenCalled();
    expect(workers.register).toHaveBeenCalledWith('/sw.js', { scope: '/', updateViaCache: 'none' });
    observer.dispose();
  });
  it('waits for REFRESH before activating a later worker and reloading', async () => {
    const workers = new Workers(); workers.controller = new Worker();
    const next = new Worker(); workers.registration.installing = next;
    const ready = vi.fn(); const reload = vi.fn();
    const observer = await observeUpdates(workers.api, ready, reload);
    workers.registration.installed(next);
    expect(ready).toHaveBeenCalledOnce();
    expect(next.postMessage).not.toHaveBeenCalled(); expect(reload).not.toHaveBeenCalled();
    ready.mock.calls[0][0]();
    expect(next.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    workers.controller = next; workers.dispatchEvent(new Event('controllerchange'));
    expect(reload).toHaveBeenCalledOnce();
    observer.dispose();
  });
  it('finds an already waiting update and handles activation in another tab', async () => {
    const workers = new Workers(); workers.controller = new Worker(); workers.registration.waiting = new Worker();
    const ready = vi.fn(); const reload = vi.fn();
    const observer = await observeUpdates(workers.api, ready, reload);
    workers.registration.waiting = null;
    ready.mock.calls[0][0]();
    expect(reload).toHaveBeenCalledOnce();
    observer.dispose();
  });
  it('handles an offline update check quietly and removes its listeners', async () => {
    const workers = new Workers(); workers.controller = new Worker();
    workers.registration.update.mockRejectedValueOnce(new Error('Offline'));
    const ready = vi.fn(); const observer = await observeUpdates(workers.api, ready, vi.fn());
    await expect(observer.check()).resolves.toBeUndefined();
    observer.dispose();
    workers.registration.installing = new Worker();
    workers.registration.dispatchEvent(new Event('updatefound'));
    workers.registration.installed(workers.registration.installing);
    expect(ready).not.toHaveBeenCalled();
    await observer.check(); expect(workers.registration.update).toHaveBeenCalledOnce();
  });
});
