import { z } from 'zod';
import type { TemplateData, TemplateFormStep } from '@/core/models/template';

export const EDITOR_SCENES = [
  'cover',
  'intro',
  'song',
  'photos',
  'letter',
  'reasons',
  'coupon',
  'finale',
  'review',
] as const;
export type EditorScene = (typeof EDITOR_SCENES)[number];
const songSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  artist: z.string(),
  start: z.number(),
  end: z.number(),
  lyrics: z.array(z.object({ time: z.number(), text: z.string() })),
  lyricsOffset: z.number().optional(),
  lyricsId: z.number().optional(),
});
export const templateDataSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number(), z.boolean()])),
    z.array(songSchema),
    z.null(),
    z.undefined(),
  ])
);
export const editorUpdateSchema = z.object({
  type: z.literal('flower-editor:update'),
  templateKey: z.string(),
  data: templateDataSchema,
  scene: z.enum(EDITOR_SCENES),
  revision: z.number().int().nonnegative(),
});
export type EditorUpdate = z.infer<typeof editorUpdateSchema>;

export function fieldScene(name: string): EditorScene {
  if (name === 'message') return 'letter';
  if (name === 'closingLine') return 'finale';
  if (name === 'startDate') return 'intro';
  if (name === 'songs' || name === 'musicUrl') return 'song';
  if (name === 'image' || name === 'timelinePhotos') return 'photos';
  if (name === 'reasonsToLove') return 'reasons';
  if (name.startsWith('coupon')) return 'coupon';
  return 'cover';
}
export function stepScene(step: TemplateFormStep | undefined): EditorScene {
  return step?.previewScene ?? fieldScene(step?.fields[0]?.name ?? '');
}
export function formDefaults(steps: TemplateFormStep[]): TemplateData {
  return Object.fromEntries(
    steps
      .flatMap((step) => step.fields)
      .flatMap((field) =>
        'default' in field && field.default !== undefined
          ? [[field.name, field.default]]
          : []
      )
  );
}
