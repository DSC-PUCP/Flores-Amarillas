import { useEffect, useMemo, useRef, useState } from 'react';
import { activeLineIndex } from '../lrc';
import { readSongClips } from '../song-clip';
import { useYouTubePlayer } from './useYouTubePlayer';

/**
 * Reproduce en orden los fragmentos elegidos en el formulario y expone la
 * línea de letra que suena, para que cada plantilla la dibuje a su estilo.
 *
 * En iPhone el audio solo arranca desde un toque: llama a `play()` dentro del
 * onClick del botón de inicio de la plantilla.
 */
export function useSongClips(value: unknown) {
  const songs = useMemo(() => readSongClips(value), [value]);
  const [index, setIndex] = useState(0);
  const loadedIndex = useRef<number | null>(null);
  const wantsToPlay = useRef(false);
  const failures = useRef(0);

  const player = useYouTubePlayer({
    onEnded: () => {
      failures.current = 0;
      loadAt((index + 1) % songs.length, true);
    },
    onError: () => {
      // Si un video falla se salta al siguiente, sin entrar en bucle.
      failures.current += 1;
      if (failures.current < songs.length) {
        loadAt((index + 1) % songs.length, true);
      }
    },
  });
  const { ready, load } = player;

  const loadAt = (next: number, autoplay: boolean) => {
    const clip = songs[next];
    if (!clip) return;
    setIndex(next);
    loadedIndex.current = next;
    load(clip, autoplay);
  };

  // Deja el primer fragmento listo apenas carga YouTube, así el toque de
  // inicio reproduce al instante.
  useEffect(() => {
    const first = songs[0];
    if (!ready || !first) return;
    setIndex(0);
    loadedIndex.current = 0;
    load(first, wantsToPlay.current);
  }, [ready, songs, load]);

  const song = songs[index] ?? null;
  const lineIndex = song
    ? activeLineIndex(song.lyrics, player.currentTime)
    : -1;
  const progress = song
    ? Math.min(
        1,
        Math.max(0, (player.currentTime - song.start) / (song.end - song.start))
      )
    : 0;

  const play = () => {
    wantsToPlay.current = true;
    if (!ready || !song) return;
    if (loadedIndex.current === null) loadAt(index, true);
    else player.play();
  };

  const pause = () => {
    wantsToPlay.current = false;
    player.pause();
  };

  return {
    hostRef: player.hostRef,
    songs,
    song,
    index,
    count: songs.length,
    ready,
    errorCode: player.errorCode,
    playing: player.playing,
    currentTime: player.currentTime,
    progress,
    lineIndex,
    play,
    pause,
    toggle: () => (player.playing ? pause() : play()),
    /** Salta a un fragmento concreto de la lista y lo reproduce. */
    goTo: (next: number) => {
      if (next >= 0 && next < songs.length) loadAt(next, true);
    },
    next: () => loadAt((index + 1) % songs.length, true),
    previous: () => loadAt((index - 1 + songs.length) % songs.length, true),
  };
}

export type SongClipsPlayer = ReturnType<typeof useSongClips>;
