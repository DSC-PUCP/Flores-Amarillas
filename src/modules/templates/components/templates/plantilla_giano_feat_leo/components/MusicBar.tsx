import { Pause, Play, SkipForward } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { SongClipsPlayer } from '@/modules/music/hooks/useSongClips';
import { youtubeThumbnail } from '@/modules/music/youtube';
import type { Mood } from '../useMood';
import { SoundWaves } from './SoundWaves';
import { Vinyl } from './Vinyl';

/** Audio de páginas antiguas (campo `musicUrl`, un mp3 directo). */
export function useLegacyAudio(url: string | null) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => setPlaying(false));
  }, []);
  const pause = useCallback(() => audioRef.current?.pause(), []);

  return {
    url,
    audioRef,
    playing,
    setPlaying,
    play,
    pause,
    toggle: () => (playing ? pause() : play()),
  };
}

export type LegacyAudio = ReturnType<typeof useLegacyAudio>;

const barClass =
  'fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-full border border-[var(--mood-card)]/10 bg-[var(--mood-deep)]/90 p-1.5 pr-2 text-[var(--mood-card)] shadow-[0_18px_40px_-16px_#000000aa] backdrop-blur-md transition-[opacity,translate] duration-500 sm:right-auto sm:left-4 sm:mx-0 sm:w-[23rem]';

/**
 * Reproductor flotante: un vinilo pequeño con la portada que sigue girando
 * mientras se recorre la página. No contiene el video: ese vive, visible, en
 * la sección "Nuestra canción".
 */
export function MusicBar({
  music,
  legacy,
  mood,
  visible,
}: {
  music: SongClipsPlayer;
  legacy: LegacyAudio;
  mood: Mood;
  visible: boolean;
}) {
  const hidden = !visible && 'pointer-events-none translate-y-6 opacity-0';
  const tabIndex = visible ? 0 : -1;

  if (music.count > 0) {
    const { song } = music;
    const line = song?.lyrics[music.lineIndex]?.text;
    return (
      <div
        data-mood-energy
        className={cn(barClass, hidden)}
        aria-hidden={!visible}
      >
        <Vinyl
          className="size-12 shrink-0"
          spinning={music.playing}
          cover={song ? youtubeThumbnail(song.videoId) : null}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{song?.title}</p>
          <p className="truncate text-xs text-[var(--mood-light)]">
            {music.playing && line ? line : song?.artist || 'Nuestra canción'}
          </p>
        </div>
        <div className="h-6 w-10 shrink-0">
          <SoundWaves
            variant="bars"
            levels={mood.levels}
            palette={mood.palette}
          />
        </div>
        <button
          type="button"
          onClick={music.toggle}
          disabled={!music.ready}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--mood-accent)] text-[#10150F] transition-transform active:scale-95 disabled:opacity-50"
          aria-label={music.playing ? 'Pausar música' : 'Reproducir música'}
          tabIndex={tabIndex}
        >
          {music.playing ? (
            <Pause size={17} fill="currentColor" />
          ) : (
            <Play size={17} fill="currentColor" className="ml-0.5" />
          )}
        </button>
        {music.count > 1 && (
          <button
            type="button"
            onClick={music.next}
            className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--mood-card)]/80 hover:bg-[var(--mood-card)]/10"
            aria-label="Siguiente canción"
            tabIndex={tabIndex}
          >
            <SkipForward size={16} />
          </button>
        )}
      </div>
    );
  }

  if (!legacy.url) return null;

  return (
    <div
      data-mood-energy
      className={cn(barClass, 'sm:w-auto', hidden)}
      aria-hidden={!visible}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: música de fondo sin diálogo */}
      <audio
        ref={legacy.audioRef}
        src={legacy.url}
        loop
        preload="auto"
        onPlay={() => legacy.setPlaying(true)}
        onPause={() => legacy.setPlaying(false)}
      />
      <Vinyl
        className="size-12 shrink-0"
        spinning={legacy.playing}
        cover={null}
      />
      <p className="min-w-0 flex-1 truncate pr-1 text-sm font-semibold">
        Nuestra canción
      </p>
      <div className="h-6 w-10 shrink-0">
        <SoundWaves
          variant="bars"
          levels={mood.levels}
          palette={mood.palette}
        />
      </div>
      <button
        type="button"
        onClick={legacy.toggle}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--mood-accent)] text-[#10150F] active:scale-95"
        aria-label={legacy.playing ? 'Pausar música' : 'Reproducir música'}
        tabIndex={tabIndex}
      >
        {legacy.playing ? (
          <Pause size={17} fill="currentColor" />
        ) : (
          <Play size={17} fill="currentColor" className="ml-0.5" />
        )}
      </button>
    </div>
  );
}
