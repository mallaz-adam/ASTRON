import { afterEach, describe, expect, it, vi } from 'vitest';
import { localDate } from '../logic/dates';
import { observeDeviceClock } from './useDeviceClock';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

function clockEnvironment() {
  let hidden = false;
  const visibility = new Set<() => void>();
  const focus = new Set<() => void>();
  vi.stubGlobal('document', {
    get hidden() { return hidden; },
    addEventListener: (_name: string, fn: () => void) => visibility.add(fn),
    removeEventListener: (_name: string, fn: () => void) => visibility.delete(fn),
  });
  vi.stubGlobal('window', {
    addEventListener: (_name: string, fn: () => void) => focus.add(fn),
    removeEventListener: (_name: string, fn: () => void) => focus.delete(fn),
  });
  return { visibility, focus, setHidden(value: boolean) { hidden = value; visibility.forEach(fn => fn()); } };
}

describe('The device clock does useful work only while visible', () => {
  it('stops hidden wake-ups, catches up immediately on return, and removes timers and listeners', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-03T12:00:00'));
    const environment = clockEnvironment(); const notify = vi.fn();
    const stop = observeDeviceClock(notify);
    expect(notify).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(1);
    environment.setHidden(true);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(90_000);
    expect(notify).toHaveBeenCalledOnce();
    environment.setHidden(false);
    expect(notify).toHaveBeenLastCalledWith(new Date('2026-11-03T12:01:30'));
    expect(vi.getTimerCount()).toBe(1);
    stop();
    expect(vi.getTimerCount()).toBe(0);
    expect(environment.visibility.size).toBe(0); expect(environment.focus.size).toBe(0);
  });
  it('still wakes at local midnight and catches a date changed while hidden', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-03T23:59:59'));
    const environment = clockEnvironment(); const notify = vi.fn();
    const stop = observeDeviceClock(notify);
    vi.advanceTimersByTime(1020);
    expect(localDate(notify.mock.lastCall![0])).toBe('2026-11-04');
    environment.setHidden(true);
    vi.setSystemTime(new Date('2026-11-05T10:00:00'));
    environment.setHidden(false);
    expect(localDate(notify.mock.lastCall![0])).toBe('2026-11-05');
    stop();
  });
});
