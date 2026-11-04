import { useEffect, useState } from 'react';

export function observeDeviceClock(notify: (now: Date) => void) {
  let timer: ReturnType<typeof setTimeout>;
  function update() {
    clearTimeout(timer);
    // No periodic wake-ups while hidden. Returning refreshes local time first.
    if (document.hidden) return;
    const current = new Date();
    notify(current);
    const midnight = new Date(current);
    midnight.setHours(24, 0, 0, 0);
    // Wake at local midnight; short checks also notice a changed device zone.
    const delay = Math.min(30_000, Math.max(1, midnight.getTime() - current.getTime() + 20));
    timer = setTimeout(update, delay);
  }
  update();
  window.addEventListener('focus', update);
  document.addEventListener('visibilitychange', update);
  return () => {
    clearTimeout(timer);
    window.removeEventListener('focus', update);
    document.removeEventListener('visibilitychange', update);
  };
}

export function useDeviceClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => observeDeviceClock(setNow), []);
  return now;
}
