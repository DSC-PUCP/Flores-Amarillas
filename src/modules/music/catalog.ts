import type { SongSearchResult } from './services';

/**
 * Las 25 canciones que ofrece el formulario. Se eligen a mano en vez de buscar
 * en YouTube: la búsqueda gasta 100 de las 10 000 unidades diarias gratis de la
 * API, o sea unas 100 búsquedas al día para todo el sitio.
 *
 * Para cambiar una canción basta con reemplazar su `videoId` (los 11
 * caracteres después de `v=` en el link de YouTube). Conviene usar el video del
 * canal oficial del artista o el de "Topic": los reuploads de fan pueden
 * desaparecer. Si un video no se deja insertar, el formulario avisa al elegirlo
 * y la página publicada salta al siguiente fragmento.
 */
export type SongGroup = 'amor' | 'alegria' | 'amistad' | 'familia' | 'peru';

export type CatalogSong = {
  videoId: string;
  /** Nombre de la canción, sin el artista. */
  title: string;
  artist: string;
  group: SongGroup;
};

export const SONG_GROUPS: { id: SongGroup; label: string }[] = [
  { id: 'amor', label: 'Para quien quieres' },
  { id: 'alegria', label: 'Para celebrar' },
  { id: 'amistad', label: 'Para tus amigos' },
  { id: 'familia', label: 'Para tu familia' },
  { id: 'peru', label: 'Desde Perú' },
];

export const SONG_CATALOG: CatalogSong[] = [
  // Para quien quieres
  {
    videoId: 'yKNxeF4KMsY',
    title: 'Yellow',
    artist: 'Coldplay',
    group: 'amor',
  },
  {
    videoId: '2Vv-BfVoq4g',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    group: 'amor',
  },
  {
    videoId: 'vGJTaP6anOU',
    title: "Can't Help Falling in Love",
    artist: 'Elvis Presley',
    group: 'amor',
  },
  {
    videoId: 'LjhCEhWiKXk',
    title: 'Just the Way You Are',
    artist: 'Bruno Mars',
    group: 'amor',
  },
  {
    videoId: 'v0ckuv1xBm0',
    title: 'Burbujas de Amor',
    artist: 'Juan Luis Guerra 4.40',
    group: 'amor',
  },
  {
    videoId: 'oR5rpFzaBaA',
    title: 'Kilómetros',
    artist: 'Sin Bandera',
    group: 'amor',
  },
  {
    videoId: 'BuY7HYSDoTM',
    title: 'Espacio Sideral',
    artist: 'Jesse & Joy',
    group: 'amor',
  },
  {
    videoId: '5TwAyUCJbl8',
    title: 'Eres Tú',
    artist: 'Carla Morrison',
    group: 'amor',
  },
  {
    videoId: '_gm5piKnrS4',
    title: 'Cómo Te Atreves',
    artist: 'Morat',
    group: 'amor',
  },
  {
    videoId: 'W4AiOKlOO0Q',
    title: 'Mi Persona Favorita',
    artist: 'Alejandro Sanz, Camila Cabello',
    group: 'amor',
  },

  // Para celebrar
  {
    videoId: '2mY7AFTtYwQ',
    title: 'Favorito',
    artist: 'Camilo',
    group: 'alegria',
  },
  {
    videoId: 'k76BgIb89-s',
    title: 'Nunca Es Suficiente',
    artist: 'Los Ángeles Azules, Natalia Lafourcade',
    group: 'alegria',
  },
  {
    videoId: 'ieBvA3kMJB4',
    title: 'Para Siempre',
    artist: 'Kany García',
    group: 'alegria',
  },
  {
    videoId: '00QVU7voMq8',
    title: 'Eres Mi Sueño',
    artist: 'Fonseca',
    group: 'alegria',
  },

  // Para tus amigos
  {
    // Sin subida oficial: si este video desaparece, buscar otro de "Flores
    // Amarillas" de Floricienta y reemplazar el id.
    videoId: 'gv63CGCx6vg',
    title: 'Flores Amarillas',
    artist: 'Floricienta',
    group: 'amistad',
  },
  {
    videoId: 'HaZpZQG2z10',
    title: "You're My Best Friend",
    artist: 'Queen',
    group: 'amistad',
  },
  {
    videoId: '6k8cpUkKK4c',
    title: 'Count on Me',
    artist: 'Bruno Mars',
    group: 'amistad',
  },
  {
    videoId: 'fOZ-MySzAac',
    title: 'Lean on Me',
    artist: 'Bill Withers',
    group: 'amistad',
  },

  // Para tu familia
  {
    videoId: 'IKmPci5VXz0',
    title: 'Hasta la Raíz',
    artist: 'Natalia Lafourcade',
    group: 'familia',
  },
  {
    videoId: 'Nb1VOQRs-Vs',
    title: 'Color Esperanza',
    artist: 'Diego Torres',
    group: 'familia',
  },
  {
    videoId: 'lDFuHhflHsw',
    title: 'Gracias a la Vida',
    artist: 'Mercedes Sosa',
    group: 'familia',
  },
  {
    videoId: '69VStYa0aBA',
    title: 'Mi Viejo',
    artist: 'Piero',
    group: 'familia',
  },

  // Desde Perú
  {
    videoId: 'GBwGNu7Mi2k',
    title: 'Los Globos del Cielo',
    artist: 'Pedro Suárez-Vértiz',
    group: 'peru',
  },
  {
    videoId: 'bfzWgptUf4U',
    title: 'Te Mentiría',
    artist: 'Gian Marco',
    group: 'peru',
  },
  {
    videoId: 'jNFhAKw3oqw',
    title: 'Cariñito',
    artist: 'Bareto',
    group: 'peru',
  },
];

/**
 * El editor de fragmento adivina canción y artista con `guessTrackAndArtist`:
 * con el nombre en `title` y el artista en `channel` los toma tal cual, que es
 * justo lo que hace falta para buscar la letra.
 */
export const catalogSongToResult = (song: CatalogSong): SongSearchResult => ({
  videoId: song.videoId,
  title: song.title,
  channel: song.artist,
  duration: null,
});
