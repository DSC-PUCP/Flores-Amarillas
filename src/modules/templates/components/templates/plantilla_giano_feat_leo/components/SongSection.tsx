import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SyncedLyrics } from '@/modules/music/components/SyncedLyrics';
import type { SongClipsPlayer } from '@/modules/music/hooks/useSongClips';
import { describePlayerError } from '@/modules/music/hooks/useYouTubePlayer';
import { formatTime } from '@/modules/music/lrc';
import { youtubeThumbnail } from '@/modules/music/youtube';
import styles from '../premium.module.css';
import type { Mood } from '../useMood';
import { SoundWaves } from './SoundWaves';
import { Vinyl } from './Vinyl';

/**
 * "Nuestra canción": tocadiscos con la portada, letra que brilla con cada
 * verso y ondas del color del álbum.
 *
 * Aquí vive el reproductor de YouTube, invisible: solo pone el sonido. Se
 * monta desde el inicio (detrás de la portada del regalo) para que el primer
 * toque ya suene. El color del álbum acompaña este escenario musical.
 */
export function SongSection({
  music,
  mood,
}: {
  music: SongClipsPlayer;
  mood: Mood;
}) {
  const { song } = music;

  const elapsed = song ? Math.max(0, music.currentTime - song.start) : 0;
  const length = song ? song.end - song.start : 0;
  const playerError = describePlayerError(music.errorCode);
  const hasLyrics = !!song && song.lyrics.length > 0;

  return (
    <section
      aria-labelledby="premium-song"
      className="relative px-3 py-16 sm:px-4 sm:py-24"
    >
      <div
        data-mood-energy
        className={cn(
          styles.stage,
          'relative mx-auto max-w-5xl px-4 pt-6 pb-4 text-[var(--mood-card)] sm:px-10'
        )}
      >
        {/* Reproductor de YouTube: solo pone el sonido, no se muestra. No
            puede ir con display:none porque el navegador no lo cargaría. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 h-[113px] w-[200px] opacity-0"
        >
          <div
            ref={music.hostRef}
            className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
          />
        </div>

        <div className="relative text-center">
          <p className={cn(styles.eyebrow, 'text-[var(--mood-light)]')}>
            Suena para ti
          </p>
          <h2
            id="premium-song"
            className={cn(styles.display, 'mt-3 text-5xl italic sm:text-6xl')}
          >
            Nuestra canción
          </h2>
        </div>

        <div className="relative mt-6 grid items-center gap-6 sm:mt-10 sm:gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-12">
          {/* Tocadiscos */}
          <div className="relative mx-auto w-[min(56vw,17rem)] sm:w-[20rem]">
            {music.playing && (
              <div aria-hidden="true" className="absolute inset-0">
                <span className={styles.ring} />
                <span className={styles.ring} />
                <span className={styles.ring} />
              </div>
            )}
            <Vinyl
              arm
              spinning={music.playing}
              cover={song ? youtubeThumbnail(song.videoId) : null}
            />
          </div>

          <div className="relative min-w-0 text-center md:text-left">
            <p
              className={cn(
                styles.display,
                'text-2xl leading-tight break-words sm:text-3xl'
              )}
            >
              {song?.title}
            </p>
            {song?.artist && (
              <p className="mt-1 text-sm text-[var(--mood-card)]/65">
                {song.artist}
              </p>
            )}

            <div className="mt-6 flex items-center justify-center gap-3 md:justify-start">
              {music.count > 1 && (
                <button
                  type="button"
                  onClick={music.previous}
                  aria-label="Canción anterior"
                  className="grid size-11 place-items-center rounded-full text-[var(--mood-card)]/80 hover:bg-[var(--mood-card)]/10"
                >
                  <SkipBack size={20} />
                </button>
              )}
              <button
                type="button"
                onClick={music.toggle}
                disabled={!music.ready}
                aria-label={
                  music.playing
                    ? 'Pausar nuestra canción'
                    : 'Escuchar nuestra canción'
                }
                className="grid size-16 place-items-center rounded-full bg-[var(--mood-accent)] text-[#10150F] shadow-[0_14px_30px_-10px_var(--mood-accent)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
              >
                {music.playing ? (
                  <Pause size={26} fill="currentColor" />
                ) : (
                  <Play size={26} fill="currentColor" className="ml-1" />
                )}
              </button>
              {music.count > 1 && (
                <button
                  type="button"
                  onClick={music.next}
                  aria-label="Siguiente canción"
                  className="grid size-11 place-items-center rounded-full text-[var(--mood-card)]/80 hover:bg-[var(--mood-card)]/10"
                >
                  <SkipForward size={20} />
                </button>
              )}
            </div>

            {playerError ? (
              <output className="mt-4 block text-sm leading-relaxed text-[var(--mood-light)]">
                {playerError}
              </output>
            ) : (
              !music.ready && (
                <p className="mt-4 text-xs text-[var(--mood-card)]/65">
                  Cargando reproductor…
                </p>
              )
            )}

            <div className="mx-auto mt-5 max-w-sm md:mx-0">
              <div className="h-1 overflow-hidden rounded-full bg-[var(--mood-card)]/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--mood-light)] to-[var(--mood-accent)] transition-[width] duration-150 ease-linear"
                  style={{ width: `${music.progress * 100}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-[var(--mood-card)]/55 tabular-nums">
                <span>{formatTime(elapsed)}</span>
                <span>{formatTime(length)}</span>
              </div>
            </div>

            {music.count > 1 && (
              <p className="mt-5 text-xs text-[var(--mood-card)]/50">
                Canción {music.index + 1} de {music.count}
              </p>
            )}
          </div>
        </div>

        {hasLyrics && (
          <div
            className="relative mt-6 min-h-[8rem] sm:mt-10 sm:min-h-[9rem]"
            aria-live="off"
          >
            <SyncedLyrics
              lines={song.lyrics}
              activeIndex={music.lineIndex}
              className="text-white"
              sideClassName={styles.lyricSide}
              currentClassName={cn(
                styles.display,
                styles.lyricNow,
                'font-normal italic text-[clamp(1.75rem,6vw,3.25rem)] leading-tight'
              )}
            />
          </div>
        )}

        <div className="relative -mx-4 mt-2 h-16 sm:-mx-10 sm:mt-6 sm:h-28">
          <SoundWaves levels={mood.levels} palette={mood.palette} />
        </div>
      </div>
    </section>
  );
}
