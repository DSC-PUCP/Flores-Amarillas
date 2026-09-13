import { useCallback, useEffect, useRef, useState } from 'react';

const VOLUME = 0.08;

interface ForestAudio {
  start: () => Promise<void>;
  pause: () => void;
  dispose: () => void;
}

/** A quiet, original D-major pentatonic motif; no downloaded recordings. */
function createForestAmbience(): ForestAudio {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1600;
  filter.connect(master);

  const delay = context.createDelay(1);
  const echo = context.createGain();
  delay.delayTime.value = 0.47;
  echo.gain.value = 0.18;
  filter.connect(delay);
  delay.connect(echo);
  echo.connect(master);
  echo.connect(delay);

  const voices = new Set<OscillatorNode>();
  const pads = [146.832, 220, 293.665].map((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.detune.value = index % 2 === 0 ? -3 : 3;
    gain.gain.value = 0.065;
    oscillator.connect(gain);
    gain.connect(filter);
    oscillator.start();
    return { oscillator, gain };
  });

  const melody = [74, 81, 78, 76, 69, 78, 83, 81, 76, 74, 78, 69];
  let noteIndex = 0;
  let nextNoteAt = 0;
  let scheduler: ReturnType<typeof setInterval> | undefined;
  let suspendTimer: ReturnType<typeof setTimeout> | undefined;
  let revision = 0;
  let disposed = false;

  const playBell = (midi: number, at: number) => {
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    for (const [ratio, intensity] of [
      [1, 0.32],
      [2, 0.05],
    ]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency * ratio;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(intensity, at + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 4.5);
      oscillator.connect(gain);
      gain.connect(filter);
      voices.add(oscillator);
      oscillator.onended = () => {
        voices.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(at);
      oscillator.stop(at + 4.6);
    }
  };

  const schedule = () => {
    if (context.state !== 'running') return;
    if (nextNoteAt < context.currentTime + 0.3) {
      // Never replay a backlog when a browser throttles its timers.
      nextNoteAt = Math.max(nextNoteAt, context.currentTime + 0.02);
      playBell(melody[noteIndex % melody.length], nextNoteAt);
      noteIndex += 1;
      nextNoteAt += noteIndex % 4 === 0 ? 3.5 : 2.15;
    }
  };

  return {
    async start() {
      if (disposed) return;
      const currentRevision = ++revision;
      clearTimeout(suspendTimer);
      clearInterval(scheduler);
      await context.resume();
      if (disposed || currentRevision !== revision) return;
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(VOLUME, now + 1.2);
      nextNoteAt = now + 0.25;
      schedule();
      scheduler = setInterval(schedule, 150);
    },
    pause() {
      if (disposed) return;
      revision += 1;
      clearInterval(scheduler);
      clearTimeout(suspendTimer);
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.16);
      suspendTimer = setTimeout(() => {
        if (!disposed) void context.suspend().catch(() => undefined);
      }, 190);
    },
    dispose() {
      disposed = true;
      revision += 1;
      clearInterval(scheduler);
      clearTimeout(suspendTimer);
      for (const oscillator of voices) {
        oscillator.onended = null;
        oscillator.stop();
        oscillator.disconnect();
      }
      voices.clear();
      for (const { oscillator, gain } of pads) {
        oscillator.stop();
        oscillator.disconnect();
        gain.disconnect();
      }
      master.disconnect();
      filter.disconnect();
      delay.disconnect();
      echo.disconnect();
      void context.close().catch(() => undefined);
    },
  };
}

function createPersonalAudio(value: string): ForestAudio {
  const url = new URL(value);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('La música necesita un enlace de audio HTTP o HTTPS.');
  }
  const audio = new Audio();
  audio.preload = 'none';
  audio.loop = true;
  audio.volume = 0;
  audio.src = url.href;
  let frame = 0;
  let revision = 0;

  return {
    async start() {
      const currentRevision = ++revision;
      cancelAnimationFrame(frame);
      audio.volume = 0;
      await audio.play();
      if (currentRevision !== revision) return;
      const startedAt = performance.now();
      const fade = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / 1200);
        audio.volume = VOLUME * progress;
        if (progress < 1) frame = requestAnimationFrame(fade);
      };
      frame = requestAnimationFrame(fade);
    },
    pause() {
      revision += 1;
      cancelAnimationFrame(frame);
      audio.pause();
      audio.volume = 0;
    },
    dispose() {
      revision += 1;
      cancelAnimationFrame(frame);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    },
  };
}

/** Audio is created only by an explicit toggle, never during render or SSR. */
export function useForestAudio(customUrl?: string) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engine = useRef<ForestAudio | null>(null);
  const enabled = useRef(false);
  const operation = useRef(0);

  const reportError = useCallback(() => {
    enabled.current = false;
    engine.current?.pause();
    setPlaying(false);
    setError('No se pudo iniciar la música. Toca para volver a intentarlo.');
  }, []);

  const toggle = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const currentOperation = ++operation.current;
    enabled.current = !enabled.current;
    setPlaying(enabled.current);
    setError(null);
    if (!enabled.current) {
      engine.current?.pause();
      return;
    }
    try {
      if (!engine.current) {
        engine.current = customUrl?.trim()
          ? createPersonalAudio(customUrl.trim())
          : createForestAmbience();
      }
      if (document.hidden) engine.current.pause();
      else await engine.current.start();
    } catch {
      if (currentOperation === operation.current) reportError();
    }
  }, [customUrl, reportError]);

  useEffect(() => {
    // Changing the selected source requires another explicit activation.
    void customUrl;
    setPlaying(false);
    setError(null);
    const onVisibilityChange = () => {
      const currentOperation = ++operation.current;
      if (document.hidden) {
        engine.current?.pause();
      } else if (enabled.current) {
        void engine.current?.start().catch(() => {
          if (currentOperation === operation.current) reportError();
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      operation.current += 1;
      enabled.current = false;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      engine.current?.dispose();
      engine.current = null;
    };
  }, [customUrl, reportError]);

  return { playing, toggle, error };
}
