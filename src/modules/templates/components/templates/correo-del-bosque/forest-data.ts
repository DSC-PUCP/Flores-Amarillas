import type { TemplateData } from '@/core/models/template';

export const FOREST_DEMO: TemplateData = {
  recipientName: 'Valeria',
  senderName: 'Ángel',
  message:
    'Hay personas que hacen que cualquier lugar se sienta como casa. Tú eres una de ellas.\n\nAsí que le pedí al bosque que guardara un poquito de su luz, sus flores más bonitas y un par de nuestros recuerdos. Todo eso está aquí, esperándote.\n\nOjalá este pequeño rincón te recuerde lo mucho que me alegra coincidir contigo.',
  flowerMessages: [
    'Por tu manera de iluminar los días normales.',
    'Por todas las risas que todavía nos esperan.',
    'Porque contigo lo sencillo se vuelve especial.',
    'Por ser un lugar bonito al que siempre volver.',
    'Por existir. Así, tal como eres.',
  ],
  photos: ['/images/memory-together.jpg', '/images/memory-day.jpg'],
  photoCaptions: ['Aquel día en que todo parecía un poquito más bonito.', 'Los lugares se olvidan menos cuando los compartimos.'],
  flowerStyle: 'mixto',
};

export function readText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function readList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && !!item.trim())
    : [];
}

export function safeImage(value: string) {
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? value : '';
  } catch {
    return '';
  }
}

export function resolveForestData(data: TemplateData) {
  const reasons = readList(data.flowerMessages).slice(0, 5);
  return {
    recipient: readText(data.recipientName, readText(data.personB, 'ti')),
    sender: readText(data.senderName, readText(data.personA, 'Alguien que te quiere')),
    message: readText(data.message, 'Te regalo un poquito de primavera, para que nunca te falte un lugar bonito al que volver.'),
    photos: readList(data.photos ?? data.timelinePhotos).map(safeImage).filter(Boolean).slice(0, 8),
    captions: readList(data.photoCaptions).slice(0, 8),
    reasons: reasons.length ? reasons : ['Porque haces que el mundo sea un poquito más bonito.', 'Por todo lo bueno que está por llegar.', 'Por la suerte de coincidir contigo.'],
    musicUrl: readText(data.musicUrl),
    flowerStyle: data.flowerStyle === 'margaritas' ? 'margaritas' : data.flowerStyle === 'girasoles' ? 'girasoles' : 'mixto',
    night: data.night === true,
  };
}

export type ForestData = ReturnType<typeof resolveForestData>;
