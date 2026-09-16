import { useEffect, useMemo, useRef, useState } from 'react';
import type { SongClip } from '@/core/models';
import { activeLineIndex } from '../lrc';
import { readSongClips } from '../song-clip';
import { useYouTubePlayer } from './useYouTubePlayer';

/** Identifica un fragmento por lo unico que le importa al reproductor. */
const claveDe = (clip: SongClip) =>
  `${clip.videoId}:${clip.start}:${clip.end}`;

/**
 * Reproduce en orden los fragmentos elegidos en el formulario y expone la
 * línea de letra que suena, para que cada plantilla la dibuje a su estilo.
 *
 * En iPhone el audio solo arranca desde un toque: llama a `play()` dentro del
 * onClick del botón de inicio de la plantilla.
 */
export function useSongClips(value: unknown) {
  /*
   * La lista se memoiza por CONTENIDO y no por la referencia de `value`.
   *
   * Aqui estaba el corte de la musica a los pocos segundos. `readSongClips`
   * devuelve un array nuevo en cada llamada, y el efecto de precarga de mas
   * abajo depende de esa identidad. La pagina del regalo sin pagar llama a
   * `router.invalidate()` cada 10 segundos para enterarse del pago: cada
   * invalidacion rehace `config_json`, con lo que `value` era otro objeto,
   * `songs` otro array, y el efecto volvia a cargar el video. Como el usuario
   * habia empezado la cancion desde la lista (`goTo`) y no desde `play()`,
   * `wantsToPlay` seguia en false y esa recarga hacia `cueVideoById`: la
   * musica se paraba en seco. Cortaba a los 10 segundos del reloj, no de la
   * cancion, y por eso parecia aleatorio —medio segundo, un segundo—.
   */
  const firma = useMemo(() => JSON.stringify(readSongClips(value)), [value]);
  const songs = useMemo(() => JSON.parse(firma) as SongClip[], [firma]);

  const [index, setIndex] = useState(0);
  const loadedIndex = useRef<number | null>(null);
  /** Que fragmento tiene puesto el reproductor ahora mismo. */
  const loadedKey = useRef<string | null>(null);
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
    loadedKey.current = claveDe(clip);
    // Pedir un fragmento con autoplay es querer escucharlo. Sin esto, elegir
    // una cancion de la lista no contaba como intencion de sonar y cualquier
    // recarga posterior la dejaba en pausa.
    if (autoplay) wantsToPlay.current = true;
    load(clip, autoplay);
  };

  // Deja el primer fragmento listo apenas carga YouTube, así el toque de
  // inicio reproduce al instante.
  useEffect(() => {
    const first = songs[0];
    if (!ready || !first) return;
    // Si el reproductor ya tiene puesto ese mismo fragmento, no se toca: una
    // recarga aqui es una cancion que se corta a mitad.
    if (loadedKey.current === claveDe(first)) return;
    setIndex(0);
    loadedIndex.current = 0;
    loadedKey.current = claveDe(first);
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
