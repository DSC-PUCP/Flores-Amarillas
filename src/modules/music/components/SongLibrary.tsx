import { Link2, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  type CatalogSong,
  catalogSongToResult,
  SONG_CATALOG,
  SONG_GROUPS,
} from '../catalog';
import type { SongSearchResult } from '../services';
import { resolveYouTubeLink } from '../services';
import { youtubeThumbnail } from '../youtube';

type Props = {
  onPick: (song: SongSearchResult) => void;
  onCancel: () => void;
};

/**
 * Lista fija de canciones, con la opción de pegar el link de cualquier otra.
 * No hay búsqueda por nombre: gastaba la cuota diaria de la API de YouTube y
 * dejaba el formulario sin música para el resto del día.
 */
export function SongLibrary({ onPick, onCancel }: Props) {
  const [link, setLink] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addFromLink = async () => {
    const url = link.trim();
    if (!url || loading) return;
    setLoading(true);
    setNotice(null);
    try {
      onPick(await resolveYouTubeLink({ data: { url } }));
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'Ese link no se pudo usar.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Elige una canción</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8 text-slate-400 hover:text-slate-700"
          aria-label="Cancelar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
        {SONG_GROUPS.map((group) => {
          const songs = SONG_CATALOG.filter((song) => song.group === group.id);
          if (songs.length === 0) return null;
          return (
            <section key={group.id}>
              <h4 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
                {group.label}
              </h4>
              <ul className="space-y-1">
                {songs.map((song) => (
                  <li key={song.videoId}>
                    <SongRow
                      song={song}
                      onPick={() => onPick(catalogSongToResult(song))}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-slate-200 pt-4">
        <p className="text-xs text-slate-500">
          ¿No está su canción? Pega aquí el link de YouTube (cópialo de la barra
          de direcciones o del botón «Compartir»).
        </p>
        <div className="flex gap-2">
          <Input
            value={link}
            onChange={(event) => setLink(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void addFromLink();
              }
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            aria-label="Link de YouTube de la canción"
            className="h-11 border-slate-200 bg-white text-slate-900"
          />
          <Button
            type="button"
            onClick={() => void addFromLink()}
            disabled={loading || link.trim().length === 0}
            className="h-11 bg-slate-900 text-white hover:bg-slate-800"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            <span className="sr-only sm:not-sr-only sm:ml-2">Usar link</span>
          </Button>
        </div>
        {notice && <p className="text-sm text-red-600">{notice}</p>}
      </div>
    </div>
  );
}

function SongRow({ song, onPick }: { song: CatalogSong; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-[#b7801a]"
    >
      <img
        src={youtubeThumbnail(song.videoId)}
        alt=""
        className="h-12 w-20 shrink-0 rounded-md object-cover"
        loading="lazy"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-800">
          {song.title}
        </span>
        <span className="block truncate text-xs text-slate-500">
          {song.artist}
        </span>
      </span>
    </button>
  );
}
