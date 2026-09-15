import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SongClipsPlayer } from '../hooks/useSongClips';

type Props = {
  player: SongClipsPlayer;
  className?: string;
};

/**
 * Reproductor flotante para las plantillas. Debe montarse desde el inicio
 * (aunque quede tapado por la portada) para que YouTube esté listo cuando la
 * persona toque el botón de empezar.
 */
export function SongMiniPlayer({ player, className }: Props) {
  const { song } = player;
  if (player.count === 0) return null;

  const line = song?.lyrics[player.lineIndex]?.text;

  return (
    <div
      className={cn(
        'fixed right-4 bottom-4 left-4 z-50 flex items-center gap-3 overflow-hidden rounded-2xl border border-rose-200 bg-white/85 p-2 pr-3 shadow-lg backdrop-blur-md sm:left-auto sm:w-80',
        className
      )}
    >
      <div className="relative h-12 w-[5.25rem] shrink-0 overflow-hidden rounded-lg bg-rose-100">
        <div
          ref={player.hostRef}
          className="pointer-events-none absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-rose-900">
          {song?.title}
        </p>
        <p className="truncate text-xs text-rose-600">
          {player.playing && line ? line : song?.artist}
        </p>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-rose-100">
          <div
            className="h-full rounded-full bg-rose-500 transition-[width] duration-150 ease-linear"
            style={{ width: `${player.progress * 100}%` }}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        {player.count > 1 && (
          <button
            type="button"
            onClick={player.previous}
            className="rounded-full p-1.5 text-rose-500 hover:bg-rose-100"
            aria-label="Canción anterior"
          >
            <SkipBack size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={player.toggle}
          disabled={!player.ready}
          className="rounded-full bg-rose-500 p-2.5 text-white shadow-md transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-60"
          aria-label={player.playing ? 'Pausar música' : 'Reproducir música'}
        >
          {player.playing ? (
            <Pause size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
        </button>
        {player.count > 1 && (
          <button
            type="button"
            onClick={player.next}
            className="rounded-full p-1.5 text-rose-500 hover:bg-rose-100"
            aria-label="Siguiente canción"
          >
            <SkipForward size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
