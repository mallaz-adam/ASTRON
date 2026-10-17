import { useCallback, useEffect, useRef, useState } from 'react';
import { advanceRace, unitPosition } from '../logic/lessonDiagrams';

export function useControlledRace(reduceMotion: boolean, active: boolean) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playVersion, setPlayVersion] = useState(0);
  const current = useRef(0);
  const frame = useRef<number | undefined>(undefined);

  const pause = useCallback(() => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = undefined;
    setPlaying(false);
  }, []);
  const seek = useCallback((position: number) => {
    pause();
    current.current = unitPosition(position);
    setTime(current.current);
  }, [pause]);
  const play = useCallback(() => {
    if (reduceMotion || !active) return;
    if (current.current >= 1) { current.current = 0; setTime(0); }
    setPlayVersion(value => value + 1);
    setPlaying(true);
  }, [reduceMotion, active]);

  useEffect(() => {
    if (!playing || reduceMotion || !active) return;
    const from = current.current;
    const started = performance.now();
    function tick(now: number) {
      const next = advanceRace(from, now - started);
      current.current = next;
      setTime(next);
      if (next < 1) frame.current = requestAnimationFrame(tick);
      else { frame.current = undefined; setPlaying(false); }
    }
    frame.current = requestAnimationFrame(tick);
    return () => { if (frame.current !== undefined) cancelAnimationFrame(frame.current); };
  }, [playing, playVersion, reduceMotion, active]);

  useEffect(() => { if (reduceMotion || !active) pause(); }, [reduceMotion, active, pause]);
  useEffect(() => {
    const visibility = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [pause]);

  return { time, playing: playing && !reduceMotion && active, seek, play, pause };
}
