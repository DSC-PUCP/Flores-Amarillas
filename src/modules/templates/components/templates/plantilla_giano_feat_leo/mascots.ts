export const MASCOT_IDS = [
  'rabbit',
  'bear',
  'cat',
  'puppy',
  'panda',
  'fox',
  'chick',
] as const;
export type GiftMascot = (typeof MASCOT_IDS)[number];

export const GIFT_MASCOTS = [
  { value: 'rabbit', label: 'Conejito' },
  { value: 'bear', label: 'Osito' },
  { value: 'cat', label: 'Gatito' },
  { value: 'puppy', label: 'Perrito' },
  { value: 'panda', label: 'Pandita' },
  { value: 'fox', label: 'Zorrito' },
  { value: 'chick', label: 'Pollito' },
] as const;

export function readGiftMascot(value: unknown): GiftMascot {
  // La opción blanca anterior ahora usa el nuevo conejito kawaii.
  if (value === 'white-rabbit') return 'rabbit';
  return (
    GIFT_MASCOTS.find((option) => option.value === value)?.value ?? 'rabbit'
  );
}
