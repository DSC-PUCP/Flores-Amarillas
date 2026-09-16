import { Loader2, Pause, Play, Repeat, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { SongClip } from '@/core/models';
import { cn } from '@/lib/utils';
import {
  describePlayerError,
  useYouTubePlayer,
} from '../hooks/useYouTubePlayer';
import {
  activeLineIndex,
  clipLyrics,
  fitClipToSong,
  formatTime,
  parseLrc,
} from '../lrc';
import {
  findLyrics,
  type LyricsCandidate,
  type SongSearchResult,
} from '../services';
import { guessTrackAndArtist } from '../youtube';

const MIN_CLIP_SECONDS = 3;

type Props = {
  source: SongSearchResult;
  initial?: SongClip;
  maxClipSeconds: number;
  onSave: (clip: SongClip) => void;
  onCancel: () => void;
  /**
   * Si la plantilla de destino dibuja la letra. En `false` se esconde todo el
   * bloque de letra sincronizada: buscarla, elegirla y cuadrar su desfase es
   * un rato de trabajo, y no tiene sentido pedirlo para algo que esa plantilla
   * no muestra. El fragmento se guarda igual, solo que sin lineas.
   */
  lyrics?: boolean;
};

export function ClipEditor({
  source,
  initial,
  maxClipSeconds,
  onSave,
  onCancel,
  lyrics: mostrarLetra = true,
}: Props) {
  const [guess] = useState(() =>
    initial
      ? { track: initial.title, artist: initial.artist }
      : guessTrackAndArtist(source.title, source.channel)
  );
  const [track, setTrack] = useState(guess.track);
  const [artist, setArtist] = useState(guess.artist);

  const player = useYouTubePlayer();
  const { ready, load } = player;
  const duration = player.duration || source.duration || 0;

  // Un fragmento nuevo empieza con todo el tiempo permitido: si eliges una
  // sola canción, suena completa hasta el límite (antes arrancaba en 30 s).
  const [range, setRange] = useState<[number, number]>(() =>
    initial ? [initial.start, initial.end] : [0, maxClipSeconds]
  );
  const [start, end] = range;

  // Cuando YouTube informa la duración, un fragmento nuevo no puede pasarse
  // del final de la canción.
  useEffect(() => {
    if (initial || !duration) return;
    setRange((current) => fitClipToSong(current, duration, MIN_CLIP_SECONDS));
  }, [duration, initial]);

  useEffect(() => {
    if (ready) load({ videoId: source.videoId, start: initial?.start }, false);
  }, [ready, load, source.videoId, initial?.start]);

  // --- Letra ---
  const [candidates, setCandidates] = useState<LyricsCandidate[] | null>(null);
  const [lyricsId, setLyricsId] = useState<number | null>(
    initial?.lyricsId ?? null
  );
  const [offset, setOffset] = useState(initial?.lyricsOffset ?? 0);
  const [lyricsQuery, setLyricsQuery] = useState('');
  const keepNoLyrics = useRef(
    initial !== undefined && initial.lyrics.length === 0
  );

  const lookup = async (input: Parameters<typeof findLyrics>[0]['data']) => {
    setCandidates(null);
    let found: LyricsCandidate[] = [];
    try {
      found = await findLyrics({ data: input });
    } catch {
      // Sin letra el fragmento igual funciona.
    }
    setCandidates(found);
    setLyricsId((current) => {
      if (found.some((candidate) => candidate.id === current)) return current;
      if (keepNoLyrics.current) return null;
      return found[0]?.id ?? null;
    });
    keepNoLyrics.current = false;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: se busca una sola vez al abrir el editor
  useEffect(() => {
    void lookup({
      track: guess.track,
      artist: guess.artist,
      duration: source.duration,
    });
  }, []);

  const lines = useMemo(() => {
    const chosen = candidates?.find((candidate) => candidate.id === lyricsId);
    if (!chosen) return [];
    return parseLrc(chosen.synced).map((line) => ({
      time: line.time + offset,
      text: line.text,
    }));
  }, [candidates, lyricsId, offset]);

  const activeIndex = activeLineIndex(lines, player.currentTime);
  const listRef = useRef<HTMLOListElement>(null);

  // Mantiene visible la línea que suena, sin mover la página.
  // biome-ignore lint/correctness/useExhaustiveDependencies: se recoloca cada vez que cambia la línea activa
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[data-active="true"]');
    if (!list || !active) return;
    list.scrollTo({
      top: active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2,
      behavior: 'smooth',
    });
  }, [activeIndex]);

  // --- Rango ---
  const clamp = (time: number) =>
    Math.max(0, duration ? Math.min(time, duration) : time);

  const markStart = (time: number) => {
    const from = clamp(time);
    setRange(([, to]) => {
      const keep = to > from + MIN_CLIP_SECONDS && to - from <= maxClipSeconds;
      return [from, keep ? to : clamp(from + maxClipSeconds)];
    });
  };

  const markEnd = (time: number) => {
    const to = clamp(time);
    setRange(([from]) => {
      const keep = from < to - MIN_CLIP_SECONDS && to - from <= maxClipSeconds;
      return [keep ? from : clamp(to - maxClipSeconds), to];
    });
  };

  const problem =
    end - start < MIN_CLIP_SECONDS
      ? `El fragmento debe durar al menos ${MIN_CLIP_SECONDS} segundos.`
      : end - start > maxClipSeconds
        ? `El fragmento puede durar hasta ${maxClipSeconds} segundos.`
        : null;

  const playerError = describePlayerError(player.errorCode);

  const save = () => {
    if (problem || playerError) return;
    const round = (time: number) => Math.round(time * 10) / 10;
    onSave({
      videoId: source.videoId,
      title: track.trim() || source.title,
      artist: artist.trim(),
      start: round(start),
      end: round(end),
      lyrics: clipLyrics(lines, start, end),
      lyricsOffset: offset,
      ...(lyricsId !== null && { lyricsId }),
    });
  };

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      {/* Reproductor */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
        <div
          ref={player.hostRef}
          className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full"
        />
        {!ready && !playerError && (
          <Loader2 className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-spin text-white/70" />
        )}
      </div>

      {playerError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {playerError}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="song-title" className="text-sm text-slate-600">
            Canción
          </Label>
          <Input
            id="song-title"
            value={track}
            maxLength={120}
            onChange={(event) => setTrack(event.target.value)}
            className="bg-white text-slate-900 border-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="song-artist" className="text-sm text-slate-600">
            Artista
          </Label>
          <Input
            id="song-artist"
            value={artist}
            maxLength={120}
            onChange={(event) => setArtist(event.target.value)}
            className="bg-white text-slate-900 border-slate-200"
          />
        </div>
      </div>

      {/* Fragmento */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="icon"
            disabled={!ready}
            onClick={player.playing ? player.pause : player.play}
            className="h-10 w-10 shrink-0 rounded-full bg-[#e91e63] text-white hover:bg-[#d81b60]"
            aria-label={player.playing ? 'Pausar' : 'Reproducir'}
          >
            {player.playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" />
            )}
          </Button>
          <span className="text-sm tabular-nums text-slate-600">
            {formatTime(player.currentTime)}
            {duration > 0 && ` / ${formatTime(duration)}`}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!ready || problem !== null}
            onClick={() => player.playRange(start, end)}
            className="ml-auto border-slate-200 bg-white text-slate-700"
          >
            <Repeat className="mr-1.5 h-3.5 w-3.5" />
            Escuchar fragmento
          </Button>
        </div>

        {duration > 0 ? (
          <Slider
            min={0}
            max={Math.ceil(duration)}
            step={0.5}
            value={range}
            minStepsBetweenThumbs={MIN_CLIP_SECONDS * 2}
            onValueChange={([from, to]) => setRange([from, to])}
            className="py-2 [&_[data-slot=slider-range]]:bg-[#e91e63] [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-[#e91e63] [&_[data-slot=slider-track]]:bg-slate-200"
            aria-label="Inicio y fin del fragmento"
          />
        ) : (
          <p className="text-xs text-slate-400">
            Dale play para cargar la duración de la canción.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!ready}
            onClick={() => markStart(player.currentTime)}
            className="border-slate-200 bg-white text-slate-700"
          >
            Empieza aquí
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!ready}
            onClick={() => markEnd(player.currentTime)}
            className="border-slate-200 bg-white text-slate-700"
          >
            Termina aquí
          </Button>
          <span
            className={cn(
              'ml-auto tabular-nums',
              problem ? 'text-red-500' : 'text-slate-500'
            )}
          >
            {formatTime(start)} – {formatTime(end)} · {Math.round(end - start)}{' '}
            s
          </span>
        </div>
        {problem && <p className="text-xs text-red-500">{problem}</p>}
      </div>

      {mostrarLetra && (
        <>
      {/* Letra sincronizada */}
      <div className="space-y-3 border-t border-slate-200 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-slate-700">
            Letra sincronizada
          </p>
          {candidates === null && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
          )}
        </div>

        {candidates !== null && (
          <select
            value={lyricsId ?? ''}
            onChange={(event) =>
              setLyricsId(
                event.target.value ? Number(event.target.value) : null
              )
            }
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800"
            aria-label="Letra a usar"
          >
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.track} — {candidate.artist} (
                {formatTime(candidate.duration)})
              </option>
            ))}
            <option value="">
              {candidates.length === 0
                ? 'No encontramos la letra'
                : 'Sin letra'}
            </option>
          </select>
        )}

        <div className="flex gap-2">
          <Input
            value={lyricsQuery}
            onChange={(event) => setLyricsQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && lyricsQuery.trim()) {
                event.preventDefault();
                void lookup({ query: lyricsQuery });
              }
            }}
            placeholder="¿No es la letra correcta? Búscala"
            className="h-9 bg-white text-sm text-slate-900 border-slate-200"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!lyricsQuery.trim()}
            onClick={() => void lookup({ query: lyricsQuery })}
            className="h-9 border-slate-200 bg-white text-slate-700"
            aria-label="Buscar letra"
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>

        {lines.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>¿La letra va desfasada?</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOffset((value) => value - 0.5)}
                className="h-7 border-slate-200 bg-white px-2 text-xs text-slate-700"
              >
                Antes
              </Button>
              <span className="w-12 text-center tabular-nums">
                {offset > 0 ? '+' : ''}
                {offset.toFixed(1)} s
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOffset((value) => value + 0.5)}
                className="h-7 border-slate-200 bg-white px-2 text-xs text-slate-700"
              >
                Después
              </Button>
            </div>

            <p className="text-xs text-slate-400">
              Toca una línea para escucharla. Usa “Desde” y “Hasta” para elegir
              el fragmento con la letra.
            </p>

            <ol
              ref={listRef}
              className="relative max-h-72 space-y-0.5 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1"
            >
              {lines.map((line, i) => {
                const inClip = line.time >= start - 0.01 && line.time < end;
                const nextTime = lines[i + 1]?.time ?? line.time + 5;
                return (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: las líneas se repiten y no cambian de orden
                    key={i}
                    data-active={i === activeIndex}
                    className={cn(
                      'flex items-center gap-1 rounded-md pr-1',
                      inClip && 'bg-[#e91e63]/5',
                      i === activeIndex && 'bg-[#e91e63]/15'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        player.seek(line.time);
                        player.play();
                      }}
                      className="flex min-w-0 flex-1 items-baseline gap-2 px-2 py-1.5 text-left text-sm"
                    >
                      <span className="w-9 shrink-0 text-xs tabular-nums text-slate-400">
                        {formatTime(line.time)}
                      </span>
                      <span
                        className={cn(
                          'min-w-0',
                          inClip ? 'text-slate-900' : 'text-slate-500',
                          i === activeIndex && 'font-semibold'
                        )}
                      >
                        {line.text || '♪'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => markStart(line.time)}
                      className="shrink-0 rounded px-1.5 py-1 text-[11px] font-medium text-[#e91e63] hover:bg-[#e91e63]/10"
                    >
                      Desde
                    </button>
                    <button
                      type="button"
                      onClick={() => markEnd(nextTime)}
                      className="shrink-0 rounded px-1.5 py-1 text-[11px] font-medium text-[#e91e63] hover:bg-[#e91e63]/10"
                    >
                      Hasta
                    </button>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
        </>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-900"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={save}
          disabled={problem !== null || playerError !== null}
          className="bg-[#e91e63] text-white hover:bg-[#d81b60]"
        >
          Guardar canción
        </Button>
      </div>
    </div>
  );
}
