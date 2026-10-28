import { afterEach, describe, expect, it, vi } from 'vitest';
import { observeVisibleMotion } from './useVisibleMotion';

afterEach(() => vi.unstubAllGlobals());

describe('Decorative motion does no work outside the visible experience', () => {
  it('shares one observer, pauses hidden tabs, and releases it after the last element leaves', () => {
    let report: (entries: { target: Element; isIntersecting: boolean }[]) => void = () => {};
    let hidden = false;
    let visibility = () => {};
    const disconnect = vi.fn(); const unobserve = vi.fn();
    const Observer = vi.fn(class {
      constructor(callback: typeof report) { report = callback; }
      observe = vi.fn(); unobserve = unobserve; disconnect = disconnect;
    });
    const remove = vi.fn();
    vi.stubGlobal('IntersectionObserver', Observer);
    vi.stubGlobal('document', { get hidden() { return hidden; }, addEventListener: (_: string, fn: () => void) => { visibility = fn; }, removeEventListener: remove });
    const one = {} as Element; const two = {} as Element;
    const first = vi.fn(); const second = vi.fn();
    const stopOne = observeVisibleMotion(one, first);
    const stopTwo = observeVisibleMotion(two, second);
    try {
      expect(Observer).toHaveBeenCalledOnce(); expect(first).toHaveBeenLastCalledWith(false);
      report([{ target: one, isIntersecting: true }]);
      expect(first).toHaveBeenLastCalledWith(true); expect(second).toHaveBeenLastCalledWith(false);
      hidden = true; visibility(); expect(first).toHaveBeenLastCalledWith(false);
      hidden = false; visibility(); expect(first).toHaveBeenLastCalledWith(true);
      report([{ target: one, isIntersecting: false }, { target: two, isIntersecting: true }]);
      expect(first).toHaveBeenLastCalledWith(false); expect(second).toHaveBeenLastCalledWith(true);
      stopOne(); expect(disconnect).not.toHaveBeenCalled();
    } finally { stopOne(); stopTwo(); }
    expect(disconnect).toHaveBeenCalledOnce(); expect(remove).toHaveBeenCalledOnce();
    expect(unobserve).toHaveBeenCalledWith(two);
  });
  it('keeps visible motion available without IntersectionObserver and still pauses a hidden tab', () => {
    let visibility = () => {}; let hidden = false;
    const remove = vi.fn();
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('document', { get hidden() { return hidden; }, addEventListener: (_: string, fn: () => void) => { visibility = fn; }, removeEventListener: remove });
    const notify = vi.fn(); const stop = observeVisibleMotion({} as Element, notify);
    expect(notify).toHaveBeenLastCalledWith(true);
    hidden = true; visibility(); expect(notify).toHaveBeenLastCalledWith(false);
    stop(); expect(remove).toHaveBeenCalledOnce();
  });
});
