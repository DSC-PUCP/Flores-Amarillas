import { readGiftMascot } from './mascots';
import type { PremiumData } from './types';

export const DEFAULT_CLOSING_LINE =
  'Para que nunca te falten flores amarillas.';

const text = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const url = (value: unknown) => {
  const clean = text(value);
  return clean.length > 0 ? clean : null;
};

/**
 * Las fechas del formulario son de calendario ("2024-09-21"). Se leen a
 * medianoche local: con `new Date(texto)` JS las toma como UTC y en Perú el
 * contador empezaría un día antes.
 */
export function parseStartDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }
  const clean = text(value);
  if (!clean) return null;
  const calendar = /^(\d{4})-(\d{2})-(\d{2})/.exec(clean);
  const date = calendar
    ? new Date(
        Number(calendar[1]),
        Number(calendar[2]) - 1,
        Number(calendar[3])
      )
    : new Date(clean);
  return Number.isFinite(date.getTime()) ? date : null;
}

/**
 * Las primeras cartas usaban "//" para saltar de línea. Se respeta, sin
 * romper los links que alguien pegue ("https://").
 */
export function formatLetter(value: unknown): string {
  return text(value).replace(/(?<!:)\/\/\s*/g, '\n');
}

function readReasons(value: unknown): string[] {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/\r?\n/)
      : [];
  return items.map(text).filter(Boolean);
}

/** Acepta también la URL individual que guardaban los formularios anteriores. */
function readPhotos(value: unknown): string[] {
  const items = Array.isArray(value) ? value : [value];
  return items.map(url).filter((photo): photo is string => !!photo);
}

export function readPremiumData(raw: Record<string, unknown>): PremiumData {
  const cover = url(raw.image);
  const photos = readPhotos(raw.timelinePhotos);
  const couponPhotos = [
    ...new Set([
      ...readPhotos(raw.couponImage),
      ...readPhotos(raw.couponPhotos),
    ]),
  ];
  const couponText = text(raw.couponText);

  return {
    from: text(raw.personA) || 'Alguien que te quiere',
    to: text(raw.personB) || 'ti',
    startDate: parseStartDate(raw.startDate),
    message: formatLetter(raw.message),
    closingLine: text(raw.closingLine) || DEFAULT_CLOSING_LINE,
    mascot: readGiftMascot(raw.mascot),
    cover,
    // Un solo álbum: la foto principal abre el carrusel, sin duplicarse.
    photos: [...new Set([...(cover ? [cover] : []), ...photos])],
    reasons: readReasons(raw.reasonsToLove),
    coupon: couponText ? { text: couponText, images: couponPhotos } : null,
    songs: raw.songs,
    musicUrl: url(raw.musicUrl),
  };
}

export type TimeTogether = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** true si la fecha elegida todavía no llega. */
  upcoming: boolean;
  /** Años que se cumplen hoy, si hoy es aniversario. */
  anniversaryYears: number | null;
};

export function timeTogether(start: Date, now: Date): TimeTogether {
  const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
  const total = Math.abs(diff);

  const isAnniversary =
    diff > 0 &&
    now.getDate() === start.getDate() &&
    now.getMonth() === start.getMonth() &&
    now.getFullYear() > start.getFullYear();

  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    upcoming: diff < 0,
    anniversaryYears: isAnniversary
      ? now.getFullYear() - start.getFullYear()
      : null,
  };
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
