import type { GiftMascot } from './mascots';

/**
 * Datos tal como llegan del formulario (config_json). Todo puede faltar o venir
 * con otra forma en páginas antiguas: se normaliza con `readPremiumData`.
 */
export type TemplateData = {
  personA: string;
  personB: string;
  startDate: string;
  message: string;
  closingLine?: string;
  mascot?: GiftMascot;
  image?: string;
  timelinePhotos?: string[] | string;
  reasonsToLove?: string[] | string;
  couponText?: string;
  couponImage?: string;
  couponPhotos?: string[];

  // Música: `songs` (SongClip[]) viene del campo `music`; `musicUrl` es de páginas antiguas.
  songs?: unknown;
  musicUrl?: string;
};

/** Datos listos para dibujar, sin valores ambiguos. */
export type PremiumData = {
  from: string;
  to: string;
  /** Medianoche local del día en que empezó la historia, o null. */
  startDate: Date | null;
  message: string;
  closingLine: string;
  mascot: GiftMascot;
  cover: string | null;
  photos: string[];
  reasons: string[];
  coupon: { text: string; images: string[] } | null;
  songs: unknown;
  musicUrl: string | null;
};
