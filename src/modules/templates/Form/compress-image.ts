/**
 * Las fotos se suben tal cual a Supabase Storage. Una dedicatoria premium
 * admite hasta 19 (portada, álbum y vale), y las fotos de celular pesan varios
 * MB cada una: sin esto, una sola página podía ocupar cientos de MB y la
 * subida desde datos móviles tardaba una eternidad.
 *
 * Las fotos livianas se dejan intactas, para no perder calidad recomprimiendo
 * lo que ya está bien.
 */

/** Por encima de este peso la foto se reduce antes de subirla. */
export const COMPRESS_OVER_BYTES = 2 * 1024 * 1024;

/** Peso máximo aceptado por foto, ya reducida. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Lado mayor al que se reduce una foto grande. */
const MAX_SIDE = 2000;

const QUALITY = 0.82;

export const formatBytes = (bytes: number) =>
  `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * Los GIF se dejan pasar: recomprimirlos los convertiría en una imagen fija.
 */
export const needsCompression = (file: File) =>
  file.type.startsWith('image/') &&
  file.type !== 'image/gif' &&
  file.size > COMPRESS_OVER_BYTES;

async function loadImage(file: File) {
  if (typeof createImageBitmap === 'function') {
    return await createImageBitmap(file);
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('No se pudo leer la foto'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

const rename = (name: string) => `${name.replace(/\.[^.]+$/, '')}.jpg`;

/**
 * Reduce la foto en el navegador. Si algo falla (un formato que el navegador
 * no dibuja, un canvas bloqueado) devuelve la original: prefiero una subida
 * pesada a perder la foto de alguien.
 */
export async function compressImage(file: File): Promise<File> {
  if (!needsCompression(file)) return file;
  try {
    const source = await loadImage(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(source.width, source.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(source.width * scale);
    canvas.height = Math.round(source.height * scale);
    const context = canvas.getContext('2d');
    if (!context) return file;
    // Fondo blanco: un PNG con transparencia saldría con el fondo negro en JPG.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    if ('close' in source) source.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], rename(file.name), {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}
