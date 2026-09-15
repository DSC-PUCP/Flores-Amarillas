import { youtubeThumbnail } from '@/modules/music/youtube';

/**
 * Paleta de la página. Las flores, el papel y los textos son siempre los de
 * Flores Amarillas; de la portada de la canción solo salen los cuatro colores
 * del ambiente (accent, second, light, deep), ajustados para que se lean.
 */
export type MoodPalette = {
  /** Color principal, vivo: botones, rellenos, brillos. */
  accent: string;
  /** Segundo color, para degradados, ondas y lazos. */
  second: string;
  /** Principal muy claro, para textos y detalles sobre fondo oscuro. */
  light: string;
  /** Fondo oscuro (escenario, contador, cierre). */
  deep: string;
  /** Texto principal sobre papel. */
  ink: string;
  /** Párrafos y notas sobre papel. */
  inkSoft: string;
  /** Rótulos pequeños en mayúsculas sobre papel. */
  strong: string;
  /** Palabras destacadas en los títulos. */
  highlight: string;
  /** Fondo de la página. */
  paper: string;
  /** Fondo de franjas (sección de razones). */
  band: string;
  /** Tarjetas, carta y marcos de fotos. */
  card: string;
  /** Cielo del inicio y de la portada. */
  sky: string;
  petal: string;
  petalBack: string;
  petalMid: string;
  petalMuted: string;
  seedRing: string;
  seed: string;
  seedDot: string;
  leaf: string;
  leafDark: string;
  leafPale: string;
  stem: string;
  kraft: string;
  kraftLight: string;
  kraftDark: string;
  ribbon: string;
  ribbonDark: string;
};

/** Los colores de siempre: con ellos la página se ve igual que sin música. */
export const BRAND_MOOD: MoodPalette = {
  accent: '#F7C325',
  second: '#E8863A',
  light: '#FFE9A8',
  deep: '#0E2217',
  ink: '#1E3B2A',
  inkSoft: '#6C5537',
  strong: '#8A6A1F',
  highlight: '#B7801A',
  paper: '#FFFBF2',
  band: '#FBF2DF',
  card: '#FFFDF7',
  sky: '#DCEEF7',
  petal: '#F7C325',
  petalBack: '#D89A1F',
  petalMid: '#E8B84B',
  petalMuted: '#EACB86',
  seedRing: '#8A5A1B',
  seed: '#6B4414',
  seedDot: '#3F2709',
  leaf: '#8BA84C',
  leafDark: '#6E9140',
  leafPale: '#C7D8AE',
  stem: '#4F7A3A',
  kraft: '#E8D2A6',
  kraftLight: '#F4E8D2',
  kraftDark: '#DCC08E',
  ribbon: '#EF7A5E',
  ribbonDark: '#D86A4F',
};

/** "inkSoft" -> "--mood-ink-soft" */
export const moodVar = (key: keyof MoodPalette) =>
  `--mood-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

type Hsl = { h: number; s: number; l: number };

export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h * 60, s, l };
}

function hslToRgb({ h, s, l }: Hsl): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

export function hslToHex(hsl: Hsl): string {
  const hex = (x: number) =>
    Math.round(Math.min(1, Math.max(0, x)) * 255)
      .toString(16)
      .padStart(2, '0');
  const [r, g, b] = hslToRgb(hsl);
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

const luminance = ([r, g, b]: [number, number, number]) => {
  const linear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};

const hexToRgb = (hex: string): [number, number, number] => {
  const value = Number.parseInt(hex.slice(1, 7), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
};

/** Contraste WCAG entre dos colores hex (1 a 21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(hexToRgb(a));
  const lb = luminance(hexToRgb(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Aclara u oscurece el color hasta que se lea contra `against`. */
function readable(color: Hsl, against: string, min: number): string {
  const step = luminance(hexToRgb(against)) > 0.4 ? -0.02 : 0.02;
  let current = { ...color };
  for (let i = 0; i < 50; i++) {
    const hex = hslToHex(current);
    if (contrastRatio(hex, against) >= min) return hex;
    current = { ...current, l: clamp(current.l + step, 0, 1) };
  }
  return hslToHex(current);
}

/** Texto oscuro que va encima de los botones de color. */
export const ON_ACCENT = '#10150F';

/**
 * Colores de la canción. Solo cambian las luces, el escenario del tocadiscos,
 * el reproductor y las superficies oscuras. Las flores, el papel y los textos
 * siguen siendo los de Flores Amarillas: la identidad no se negocia.
 */
export function themeFrom(main: Hsl, second: Hsl): MoodPalette {
  const { h, s } = main;
  const accentHsl = { h, s: clamp(s, 0.05, 0.92), l: clamp(main.l, 0.54, 0.7) };
  return {
    ...BRAND_MOOD,
    accent: readable(accentHsl, ON_ACCENT, 5),
    second: hslToHex({
      h: second.h,
      s: clamp(second.s, 0.05, 0.9),
      l: clamp(second.l, 0.5, 0.68),
    }),
    light: hslToHex({ h, s: Math.min(0.85, s + 0.2), l: 0.86 }),
    deep: readable(
      { h, s: clamp(s * 0.6, 0.06, 0.45), l: 0.12 },
      '#FFFFFF',
      12
    ),
  };
}

const HUE_BINS = 12;

/**
 * Elige los colores de una portada a partir de sus píxeles RGBA. Agrupa por
 * tono y premia los colores vivos, no los más abundantes: una portada casi
 * negra con letras rojas debe dar rojo, no gris.
 */
export function pickPalette(pixels: Uint8ClampedArray): MoodPalette | null {
  const bins = Array.from({ length: HUE_BINS }, () => ({
    weight: 0,
    h: 0,
    s: 0,
    l: 0,
  }));
  let pixelsSeen = 0;
  let lightness = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    pixelsSeen += 1;
    const { h, s, l } = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
    lightness += l;
    if (s < 0.22 || l < 0.12 || l > 0.9) continue;
    const weight = s * (1 - Math.abs(l - 0.5) * 1.3);
    const bin = bins[Math.floor(h / (360 / HUE_BINS)) % HUE_BINS];
    bin.weight += weight;
    bin.h += h * weight;
    bin.s += s * weight;
    bin.l += l * weight;
  }

  if (pixelsSeen === 0) return null;

  const ranked = bins
    .map((bin, index) => ({ ...bin, index }))
    .filter((bin) => bin.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  // Portadas en blanco y negro (o casi): perla si es clara, grafito si no.
  if (!ranked.length || ranked[0].weight < pixelsSeen * 0.012) {
    const bright = lightness / pixelsSeen > 0.55;
    return themeFrom(
      { h: 265, s: bright ? 0.12 : 0.04, l: bright ? 0.9 : 0.85 },
      { h: 250, s: bright ? 0.14 : 0.05, l: 0.6 }
    );
  }

  const average = (bin: (typeof ranked)[number]): Hsl => ({
    h: bin.h / bin.weight,
    s: bin.s / bin.weight,
    l: bin.l / bin.weight,
  });

  const main = average(ranked[0]);
  const distance = (a: number, b: number) => {
    const d = Math.abs(a - b) % HUE_BINS;
    return Math.min(d, HUE_BINS - d);
  };
  const other = ranked.find(
    (bin) =>
      distance(bin.index, ranked[0].index) >= 2 &&
      bin.weight >= ranked[0].weight * 0.15
  );
  const second = other ? average(other) : { ...main, h: (main.h + 38) % 360 };

  return themeFrom(
    { ...main, s: clamp(main.s, 0.6, 0.92) },
    { ...second, s: clamp(second.s, 0.55, 0.9) }
  );
}

const cache = new Map<string, Promise<MoodPalette | null>>();

/**
 * Lee la portada del video (YouTube la sirve con CORS abierto) y saca sus
 * colores. En los videos "Topic" el cuadro central es la carátula del álbum.
 */
export function loadAlbumPalette(videoId: string): Promise<MoodPalette | null> {
  const cached = cache.get(videoId);
  if (cached) return cached;

  const promise = new Promise<MoodPalette | null>((resolve) => {
    if (typeof Image === 'undefined' || typeof document === 'undefined') {
      resolve(null);
      return;
    }
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return resolve(null);
        const side = Math.min(image.width, image.height);
        context.drawImage(
          image,
          (image.width - side) / 2,
          (image.height - side) / 2,
          side,
          side,
          0,
          0,
          size,
          size
        );
        resolve(pickPalette(context.getImageData(0, 0, size, size).data));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = youtubeThumbnail(videoId);
  });

  cache.set(videoId, promise);
  return promise;
}
