import { Link2, Loader2, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTime } from '../lrc';
import {
  resolveYouTubeLink,
  type SongSearchResult,
  searchSongs,
} from '../services';
import { looksLikeYouTubeLink, youtubeThumbnail } from '../youtube';

type Props = {
  onPick: (song: SongSearchResult) => void;
  onCancel: () => void;
};

export function SongSearch({ onPick, onCancel }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SongSearchResult[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    const text = query.trim();
    if (text.length < 2 || loading) return;
    setLoading(true);
    setNotice(null);
    try {
      if (looksLikeYouTubeLink(text)) {
        onPick(await resolveYouTubeLink({ data: { url: text } }));
        return;
      }
      const response = await searchSongs({ data: { query: text } });
      setResults(response.results);
      if (!response.enabled) {
        setNotice(
          'Pega aquí el link de YouTube de la canción (copia la dirección del video o usa "Compartir").'
        );
      } else if (response.results.length === 0) {
        setNotice(
          'No encontramos esa canción. Prueba con el nombre y el artista.'
        );
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Algo salió mal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Agregar canción</p>
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

      <div className="flex gap-2">
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void run();
            }
          }}
          placeholder="Nombre y artista, o link de YouTube"
          className="h-11 bg-white text-slate-900 border-slate-200 focus:border-[#e91e63] focus:ring-[#e91e63]/20"
        />
        <Button
          type="button"
          onClick={() => void run()}
          disabled={loading || query.trim().length < 2}
          className="h-11 bg-slate-900 text-white hover:bg-slate-800"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : looksLikeYouTubeLink(query) ? (
            <Link2 className="h-4 w-4" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="sr-only sm:not-sr-only sm:ml-2">
            {looksLikeYouTubeLink(query) ? 'Usar link' : 'Buscar'}
          </span>
        </Button>
      </div>

      {notice && <p className="text-sm text-slate-500">{notice}</p>}

      {results.length > 0 && (
        <ul className="space-y-1">
          {results.map((result) => (
            <li key={result.videoId}>
              <button
                type="button"
                onClick={() => onPick(result)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-[#e91e63]"
              >
                <img
                  src={youtubeThumbnail(result.videoId)}
                  alt=""
                  className="h-12 w-20 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-medium text-slate-800">
                    {result.title}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {result.channel}
                    {result.duration ? ` · ${formatTime(result.duration)}` : ''}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
