import {useEffect, useRef, useState} from 'react';

/** UI clock only. Sampling/rendering never depends on this hook's progression. */
export function useMotionPlayback(durationMs: number, enabled: boolean, reduced: boolean) {
  const [time, setTime] = useState(0), [playing, setPlaying] = useState(false), [speed, setSpeed] = useState(1);
  const current = useRef(time); current.current = time;
  useEffect(() => {
    setPlaying(false); setTime(0);
  }, [durationMs, enabled]);
  useEffect(() => {if (reduced) setPlaying(false);}, [reduced]);
  useEffect(() => {
    if (!enabled || !playing || reduced || !durationMs) return;
    let frame = 0, previous: number | null = null;
    const tick = (now: number) => {
      const next = Math.min(durationMs, current.current + (previous === null ? 0 : now - previous) * speed);
      previous = now; current.current = next; setTime(next);
      if (next === durationMs) setPlaying(false); else frame = requestAnimationFrame(tick);
    };
    const hide = () => {if (document.hidden) {cancelAnimationFrame(frame); setPlaying(false);}};
    frame = requestAnimationFrame(tick); document.addEventListener('visibilitychange', hide);
    return () => {cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', hide);};
  }, [durationMs, enabled, playing, reduced, speed]);
  return {time, playing, speed, setSpeed,
    pause: () => setPlaying(false),
    seek: (value: number) => {setPlaying(false); if (Number.isFinite(value)) setTime(Math.min(durationMs, Math.max(0, value)));},
    restart: () => {setPlaying(false); setTime(0);},
    play: () => {if (enabled && !reduced && durationMs) {if (current.current >= durationMs) setTime(0); setPlaying(true);}},
  };
}
