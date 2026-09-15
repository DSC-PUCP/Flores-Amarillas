import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { extractYouTubeId } from './youtube';

export type SongSearchResult = {
  videoId: string;
  title: string;
  channel: string;
  /** Segundos. Siempre null: la duración la informa el reproductor. */
  duration: number | null;
};

export type LyricsCandidate = {
  id: number;
  track: string;
  artist: string;
  duration: number;
  /** Letra en formato LRC. */
  synced: string;
};

// LRCLIB pide identificar la app en el User-Agent.
const LRCLIB_HEADERS = { 'User-Agent': 'FloresAmarillas/1.0 (dedicatorias)' };

/** Lee un link pegado. No gasta cuota: usa oEmbed, que además falla si el video no se puede insertar. */
export const resolveYouTubeLink = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ url: z.string().trim().min(1).max(300) }))
  .handler(async ({ data }): Promise<SongSearchResult> => {
    const videoId = extractYouTubeId(data.url);
    if (!videoId) throw new Error('Ese link no parece de YouTube.');

    const response = await fetch(
      `https://www.youtube.com/oembed?${new URLSearchParams({
        format: 'json',
        url: `https://www.youtube.com/watch?v=${videoId}`,
      })}`
    );
    if (!response.ok) {
      throw new Error(
        'Ese video no existe o no permite reproducirse fuera de YouTube. Prueba con otra versión.'
      );
    }
    const body = (await response.json()) as {
      title: string;
      author_name: string;
    };
    return {
      videoId,
      title: body.title,
      channel: body.author_name,
      duration: null,
    };
  });

type LrclibRow = {
  id: number;
  trackName: string;
  artistName: string;
  duration: number;
  syncedLyrics: string | null;
};

/** Letras sincronizadas de LRCLIB (gratis, sin clave). */
export const findLyrics = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      track: z.string().max(200).optional(),
      artist: z.string().max(200).optional(),
      query: z.string().max(200).optional(),
      duration: z.number().positive().nullish(),
    })
  )
  .handler(async ({ data }): Promise<LyricsCandidate[]> => {
    const attempts: Record<string, string>[] = [];
    if (data.query?.trim()) {
      attempts.push({ q: data.query.trim() });
    } else if (data.track?.trim()) {
      attempts.push(
        data.artist?.trim()
          ? { track_name: data.track, artist_name: data.artist }
          : { track_name: data.track }
      );
      attempts.push({ q: `${data.artist ?? ''} ${data.track}`.trim() });
    }

    for (const params of attempts) {
      const response = await fetch(
        `https://lrclib.net/api/search?${new URLSearchParams(params)}`,
        { headers: LRCLIB_HEADERS }
      );
      if (!response.ok) continue;

      const rows = ((await response.json()) as LrclibRow[]).filter(
        (row) => row.syncedLyrics
      );
      if (rows.length === 0) continue;

      const duration = data.duration;
      if (duration) {
        rows.sort(
          (a, b) =>
            Math.abs(a.duration - duration) - Math.abs(b.duration - duration)
        );
      }
      return rows.slice(0, 6).map((row) => ({
        id: row.id,
        track: row.trackName,
        artist: row.artistName,
        duration: row.duration,
        synced: row.syncedLyrics as string,
      }));
    }
    return [];
  });
