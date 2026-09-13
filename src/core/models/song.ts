/** Una línea de letra con el segundo del video de YouTube en que empieza. */
export type LyricLine = {
  time: number;
  text: string;
};

/**
 * Un fragmento de canción elegido en el formulario. Se guarda tal cual en el
 * config_json de la página.
 */
export type SongClip = {
  videoId: string;
  title: string;
  artist: string;
  /** Segundo del video donde empieza el fragmento. */
  start: number;
  /** Segundo del video donde termina el fragmento. */
  end: number;
  /** Solo las líneas del fragmento, con la sincronía ya ajustada al video. */
  lyrics: LyricLine[];
  /** Ajuste de sincronía y letra elegida, para poder volver a editar. */
  lyricsOffset?: number;
  lyricsId?: number;
};
