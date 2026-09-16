import { ArrowDown, ArrowUp, Music, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { SongClip } from '@/core/models';
import type { MusicTemplateField } from '@/core/models/template';
import { formatTime } from '../lrc';
import type { SongSearchResult } from '../services';
import { readSongClips } from '../song-clip';
import { youtubeThumbnail } from '../youtube';
import { ClipEditor } from './ClipEditor';
import { SongLibrary } from './SongLibrary';

type Props = {
  field: MusicTemplateField;
  value: unknown;
  onChange: (songs: SongClip[]) => void;
};

type EditorState = {
  index: number | null;
  source: SongSearchResult;
  initial?: SongClip;
};

/** Campo `music` del formulario: varias canciones, cada una con su fragmento. */
export function SongPicker({ field, value, onChange }: Props) {
  const songs = readSongClips(value);
  const maxSongs = field.max_songs ?? 3;
  const maxClipSeconds = field.max_clip_seconds ?? 90;

  const [picking, setPicking] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const busy = picking || editor !== null;

  const save = (clip: SongClip) => {
    if (!editor) return;
    const next = [...songs];
    if (editor.index === null) next.push(clip);
    else next[editor.index] = clip;
    onChange(next);
    setEditor(null);
  };

  const move = (from: number, to: number) => {
    const next = [...songs];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium text-slate-700">
          {field.label}{' '}
          {field.required && <span className="text-[#e91e63]">*</span>}
        </Label>
        <span className="text-xs font-medium text-slate-400">
          {songs.length} / {maxSongs}
        </span>
      </div>

      {songs.length > 0 && (
        <ul className="space-y-2">
          {songs.map((song, i) => (
            <li
              key={`${song.videoId}-${song.start}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2"
            >
              <img
                src={youtubeThumbnail(song.videoId)}
                alt=""
                className="h-12 w-20 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {i + 1}. {song.title}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {song.artist ? `${song.artist} · ` : ''}
                  {formatTime(song.start)} – {formatTime(song.end)}
                  {song.lyrics.length > 0 ? ' · con letra' : ''}
                </p>
              </div>
              <div className="flex shrink-0">
                {songs.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={busy || i === 0}
                      onClick={() => move(i, i - 1)}
                      className="h-8 w-8 text-slate-400"
                      aria-label="Subir"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={busy || i === songs.length - 1}
                      onClick={() => move(i, i + 1)}
                      className="h-8 w-8 text-slate-400"
                      aria-label="Bajar"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  onClick={() =>
                    setEditor({
                      index: i,
                      initial: song,
                      source: {
                        videoId: song.videoId,
                        title: song.title,
                        channel: song.artist,
                        duration: null,
                      },
                    })
                  }
                  className="h-8 w-8 text-slate-400 hover:text-slate-800"
                  aria-label="Editar fragmento"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  onClick={() => onChange(songs.filter((_, j) => j !== i))}
                  className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Quitar canción"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editor ? (
        <ClipEditor
          key={`${editor.source.videoId}-${editor.index}`}
          source={editor.source}
          initial={editor.initial}
          maxClipSeconds={maxClipSeconds}
          lyrics={field.lyrics ?? true}
          onSave={save}
          onCancel={() => setEditor(null)}
        />
      ) : picking ? (
        <SongLibrary
          onPick={(source) => {
            setPicking(false);
            setEditor({ index: null, source });
          }}
          onCancel={() => setPicking(false)}
        />
      ) : (
        songs.length < maxSongs && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setPicking(true)}
            className="h-auto w-full border-dashed py-4 hover:border-[#e91e63] hover:bg-[#e91e63]/5 hover:text-[#e91e63]"
          >
            {songs.length === 0 ? (
              <Music className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {songs.length === 0 ? 'Elegir canción' : 'Agregar otra canción'}
          </Button>
        )
      )}

      <p className="text-xs text-slate-400">
        Cada canción puede sonar hasta {maxClipSeconds} s. Con una sola, se
        repite mientras recorren el regalo; si pones varias, suenan una tras
        otra.
      </p>
    </div>
  );
}
