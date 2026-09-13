import { z } from 'zod';
import type { SongClip } from '@/core/models';

const songClipSchema = z
  .object({
    videoId: z.string().regex(/^[\w-]{11}$/),
    title: z.string().max(200),
    artist: z.string().max(200).catch(''),
    start: z.number().min(0),
    end: z.number().positive(),
    lyrics: z
      .array(z.object({ time: z.number(), text: z.string().max(500) }))
      .max(500)
      .catch([]),
    lyricsOffset: z.number().optional().catch(undefined),
    lyricsId: z.number().optional().catch(undefined),
  })
  .refine((clip) => clip.end > clip.start);

/** El config_json viene de la base: se valida antes de reproducir. */
export function readSongClips(value: unknown): SongClip[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = songClipSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}
