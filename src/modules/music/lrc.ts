import type { LyricLine } from '@/core/models';

const TIME_TAG = /\[(\d+):(\d{1,2}(?:[.:]\d{1,3})?)\]/g;

/** Convierte una letra en formato LRC ("[01:23.45] texto") en líneas ordenadas. */
export function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const tags = [...raw.matchAll(TIME_TAG)];
    if (tags.length === 0) continue;
    // Las líneas vacías marcan pausas instrumentales: se conservan.
    const text = raw.replace(TIME_TAG, '').trim();
    for (const [, minutes, seconds] of tags) {
      lines.push({
        time: Number(minutes) * 60 + Number(seconds.replace(':', '.')),
        text,
      });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

/** Índice de la línea que suena en `time`, o -1 si aún no empieza la letra. */
export function activeLineIndex(lines: LyricLine[], time: number): number {
  let active = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time > time) break;
    active = i;
  }
  return active;
}

/**
 * Recorta la letra al fragmento. Conserva la línea que ya estaba sonando al
 * inicio para que el fragmento no arranque sin texto.
 */
export function clipLyrics(
  lines: LyricLine[],
  start: number,
  end: number
): LyricLine[] {
  const first = Math.max(activeLineIndex(lines, start), 0);
  return lines
    .slice(first)
    .filter((line) => line.time < end)
    .map((line) => ({
      time: Math.round(line.time * 100) / 100,
      text: line.text,
    }));
}

/** 83.4 -> "1:23" */
export function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

/**
 * Ajusta un fragmento a la canción: si el video dura menos que el fragmento
 * elegido, el final se recorta a la duración real y el inicio se mueve si hace
 * falta, conservando al menos `minSeconds`.
 */
export function fitClipToSong(
  [start, end]: [number, number],
  duration: number,
  minSeconds: number
): [number, number] {
  if (!duration || end <= duration) return [start, end];
  const fittedEnd = Math.floor(duration * 2) / 2;
  const fittedStart = Math.min(start, Math.max(0, fittedEnd - minSeconds));
  return [fittedStart, fittedEnd];
}
