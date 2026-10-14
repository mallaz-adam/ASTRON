import { useEffect, useState } from 'react';

export function useDeviceClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function update() {
      clearTimeout(timer);
      const current = new Date();
      setNow(current);
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
  }, []);
  return now;
}
