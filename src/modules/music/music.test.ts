import { describe, expect, it } from 'vitest';
import { describePlayerError, isIpHostname } from './hooks/useYouTubePlayer';
import {
  activeLineIndex,
  clipLyrics,
  fitClipToSong,
  formatTime,
  parseLrc,
} from './lrc';
import { readSongClips } from './song-clip';
import {
  extractYouTubeId,
  guessTrackAndArtist,
  looksLikeYouTubeLink,
  parseIsoDuration,
} from './youtube';

describe('parseLrc', () => {
  it('ordena las líneas y conserva las pausas vacías', () => {
    const lines = parseLrc(
      '[ar: Coldplay]\n[00:19.20] Look at the stars\n[00:24.00]\n[00:10.5] Intro'
    );
    expect(lines).toEqual([
      { time: 10.5, text: 'Intro' },
      { time: 19.2, text: 'Look at the stars' },
      { time: 24, text: '' },
    ]);
  });

  it('repite una línea con varias marcas de tiempo', () => {
    expect(parseLrc('[00:01.00][00:05.00] Coro')).toHaveLength(2);
  });
});

describe('clipLyrics', () => {
  const lines = [
    { time: 5, text: 'a' },
    { time: 10, text: 'b' },
    { time: 15, text: 'c' },
    { time: 20, text: 'd' },
  ];

  it('incluye la línea que ya sonaba al inicio y corta al final', () => {
    expect(clipLyrics(lines, 12, 20).map((l) => l.text)).toEqual(['b', 'c']);
  });

  it('encuentra la línea activa', () => {
    expect(activeLineIndex(lines, 4)).toBe(-1);
    expect(activeLineIndex(lines, 15)).toBe(2);
  });
});

describe('youtube', () => {
  it('extrae el id de distintos formatos de link', () => {
    for (const link of [
      'https://www.youtube.com/watch?v=yKNxeF4KMsY&t=3',
      'youtu.be/yKNxeF4KMsY',
      'https://music.youtube.com/watch?v=yKNxeF4KMsY',
      'https://youtube.com/shorts/yKNxeF4KMsY',
    ]) {
      expect(extractYouTubeId(link)).toBe('yKNxeF4KMsY');
    }
    expect(extractYouTubeId('https://vimeo.com/123')).toBeNull();
  });

  it('no confunde un nombre de canción de 11 letras con un link', () => {
    expect(looksLikeYouTubeLink('Bohemianxyz')).toBe(false);
  });

  it('lee duraciones ISO 8601', () => {
    expect(parseIsoDuration('PT4M33S')).toBe(273);
    expect(parseIsoDuration('PT1H2S')).toBe(3602);
  });

  it('limpia el título del video para buscar la letra', () => {
    expect(
      guessTrackAndArtist('Coldplay - Yellow (Official Video)', 'Coldplay')
    ).toEqual({ track: 'Yellow', artist: 'Coldplay' });
    expect(
      guessTrackAndArtist('Tusa (Letra) ft. Nicki Minaj', 'Karol G - Topic')
    ).toEqual({ track: 'Tusa', artist: 'Karol G' });
  });
});

describe('readSongClips', () => {
  it('descarta canciones mal formadas', () => {
    const clips = readSongClips([
      {
        videoId: 'yKNxeF4KMsY',
        title: 'Yellow',
        artist: 'Coldplay',
        start: 10,
        end: 40,
        lyrics: [],
      },
      { videoId: 'bad', title: 'x', start: 0, end: 5 },
      { videoId: 'yKNxeF4KMsY', title: 'x', start: 20, end: 10 },
    ]);
    expect(clips).toHaveLength(1);
    expect(formatTime(clips[0].end)).toBe('0:40');
  });
});

describe('describePlayerError', () => {
  it('explica el bloqueo cuando la página se abre desde una IP', () => {
    expect(isIpHostname('127.0.0.1')).toBe(true);
    expect(isIpHostname('192.168.0.223')).toBe(true);
    expect(isIpHostname('[::1]')).toBe(true);
    expect(isIpHostname('localhost')).toBe(false);
    expect(isIpHostname('dedicatoriasenflor.com')).toBe(false);

    expect(describePlayerError(150, '192.168.0.223')).toContain('dirección IP');
    expect(describePlayerError(150, 'localhost')).toContain('canal oficial');
    expect(describePlayerError(null, '127.0.0.1')).toBeNull();
  });
});

describe('fitClipToSong', () => {
  it('deja intacto un fragmento que cabe en la canción', () => {
    expect(fitClipToSong([0, 90], 213, 3)).toEqual([0, 90]);
  });

  it('recorta el final si la canción dura menos que el límite', () => {
    expect(fitClipToSong([0, 90], 62.4, 3)).toEqual([0, 62]);
  });

  it('mueve el inicio para conservar el mínimo cuando no alcanza', () => {
    expect(fitClipToSong([60, 90], 61, 3)).toEqual([58, 61]);
  });

  it('no hace nada mientras la duración no se conoce', () => {
    expect(fitClipToSong([0, 90], 0, 3)).toEqual([0, 90]);
  });
});
