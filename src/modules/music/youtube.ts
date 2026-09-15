const VIDEO_ID = /^[\w-]{11}$/;

export const youtubeThumbnail = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

/** Acepta links de youtube.com, youtu.be, music.youtube.com, shorts o embed. */
export function extractYouTubeId(input: string): string | null {
  const value = input.trim();
  if (VIDEO_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let candidate: string | null = null;
  if (host === 'youtu.be') {
    candidate = url.pathname.split('/')[1] ?? null;
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    candidate = url.searchParams.get('v');
    if (!candidate) {
      const [, kind, id] = url.pathname.split('/');
      if (['embed', 'shorts', 'live', 'v'].includes(kind)) candidate = id;
    }
  }
  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

export const looksLikeYouTubeLink = (input: string) =>
  /youtu\.?be/i.test(input) && extractYouTubeId(input) !== null;

const NOISE =
  /\s*[([][^)\]]*\b(?:official|oficial|video|v[ií]deo|audio|lyrics?|letra|visuali[sz]er|hd|4k|remaster(?:ed)?|mv)\b[^)\]]*[)\]]/gi;
const FEATURING = /\s*[([]?\b(?:ft|feat)\.?\s[^)\]]*[)\]]?/i;

/**
 * Adivina canción y artista a partir del título del video, para buscar la
 * letra. "Coldplay - Yellow (Official Video)" -> Yellow / Coldplay.
 */
export function guessTrackAndArtist(title: string, channel: string) {
  const cleanTitle = title.replace(NOISE, '').replace(/\s+/g, ' ').trim();
  const cleanChannel = channel
    .replace(/\s*-\s*Topic$/i, '')
    .replace(/VEVO$/i, '')
    .trim();

  const parts = cleanTitle.split(/\s+[-–—|]\s+/);
  const [artist, track] =
    parts.length >= 2
      ? [parts[0], parts.slice(1).join(' - ')]
      : [cleanChannel, cleanTitle];

  return {
    track: track.replace(FEATURING, '').trim(),
    artist: artist.replace(FEATURING, '').trim(),
  };
}
