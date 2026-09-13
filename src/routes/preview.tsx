import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Flower2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { TEMPLATE_COMPONENTS } from '@/modules/templates/components/config/template-components';
import { TemplateRenderer } from '@/modules/templates/components/TemplateRenderer';
import {
  type GiftMascot,
  MASCOT_IDS,
} from '@/modules/templates/components/templates/plantilla_giano_feat_leo/mascots';
import {
  type EditorUpdate,
  editorUpdateSchema,
} from '@/modules/templates/Form/editor-preview-protocol';

const previewSearchSchema = z.object({
  editorTemplate: z.string().max(80).optional(),
  template: z.enum(['free', 'premium']).optional().catch('free'),
  mascot: z.enum(MASCOT_IDS).optional().catch('rabbit'),
  recipient: z.string().max(25).catch('Sofía'),
  message: z
    .string()
    .max(250)
    .catch(
      'Si tuviera que elegir un lugar bonito, sería a tu lado. Estas flores son para recordarte lo mucho que te quiero.'
    ),
  embed: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((value) => value === true || value === 'true')
    .catch(false),
});

export const Route = createFileRoute('/preview')({
  validateSearch: previewSearchSchema,
  head: () => ({
    meta: [
      { title: 'Prueba una dedicatoria · Dedicatorias en Flor' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: PreviewPage,
});

export function PreviewPage() {
  const search = Route.useSearch();
  const { embed } = search;
  const [editor, setEditor] = useState<EditorUpdate | null>(null);
  const [livePreview, setLivePreview] = useState<null | {
    recipient: string;
    message: string;
    mascot?: GiftMascot;
  }>(null);
  const { recipient, message } = livePreview ?? search;

  useEffect(() => {
    if (!embed) return;
    const receiveUpdate = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent
      )
        return;
      if (search.editorTemplate) {
        const update = editorUpdateSchema.safeParse(event.data);
        if (
          update.success &&
          update.data.templateKey === search.editorTemplate &&
          Object.hasOwn(TEMPLATE_COMPONENTS, update.data.templateKey)
        )
          setEditor(update.data);
        return;
      }
      const update = z
        .object({
          type: z.literal('flower-demo:update'),
          recipient: z.string().max(25),
          message: z.string().max(250),
          mascot: z.enum(MASCOT_IDS).optional(),
        })
        .safeParse(event.data);
      if (update.success) setLivePreview(update.data);
    };
    window.addEventListener('message', receiveUpdate);
    window.parent.postMessage(
      { type: 'flower-demo:ready' },
      window.location.origin
    );
    return () => window.removeEventListener('message', receiveUpdate);
  }, [embed, search.editorTemplate]);
  return (
    <div className="min-h-svh bg-[#FFF8D7] text-[#183E32]">
      {!embed && (
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#183E32]/15 bg-[#FFFCF4] px-4 py-3 text-xs">
          <Link
            to="/home"
            hash="demo"
            className="inline-flex items-center gap-2 font-medium"
          >
            <ArrowLeft size={16} /> Volver
          </Link>
          <span className="inline-flex items-center gap-2">
            <Flower2 size={16} /> Ejemplo interactivo · No está publicado
          </span>
          <Link
            to="/template"
            className="inline-flex items-center gap-2 rounded-full bg-[#183E32] px-4 py-2.5 font-medium text-white"
          >
            Crear mi regalo <ArrowRight size={15} />
          </Link>
        </header>
      )}
      {search.editorTemplate ? (
        editor ? (
          <TemplateRenderer
            templateKey={editor.templateKey}
            isPreview
            templateData={{
              ...editor.data,
              compactPreview: true,
              editorPreview: true,
              editorScene: editor.scene,
              editorRevision: editor.revision,
            }}
          />
        ) : (
          <output className="grid min-h-svh place-items-center px-6 text-center text-sm">
            Preparando tu regalo…
          </output>
        )
      ) : (
        <TemplateRenderer
          templateKey={
            search.template === 'premium'
              ? 'plantilla_giano_feat_leo'
              : 'plantilla_gratuita'
          }
          isPreview={true}
          templateData={{
            mascot: livePreview?.mascot ?? search.mascot,
            personA: 'Alguien que te quiere',
            personB: recipient.trim() || 'Sofía',
            message:
              message.trim() ||
              'Gracias por hacer mis días un poquito más bonitos.',
            startDate: '2024-09-21T12:00:00',
            image: '/images/memory-together.jpg',
            ...(search.template === 'premium'
              ? {
                  timelinePhotos: ['/images/memory-day.jpg'],
                  songs: [
                    {
                      videoId: 'yKNxeF4KMsY',
                      title: 'Yellow',
                      artist: 'Coldplay',
                      start: 10,
                      end: 40,
                      lyrics: [],
                    },
                  ],
                  reasonsToLove: [
                    'Tu risa contagiosa',
                    'Los pequeños detalles',
                    'Cada aventura a tu lado',
                    'Cómo haces florecer mis días',
                  ],
                  couponText: 'Un picnic entre flores amarillas',
                  couponPhotos: [
                    '/images/memory-day.jpg',
                    '/images/memory-together.jpg',
                  ],
                }
              : {}),
            compactPreview: embed,
          }}
        />
      )}
    </div>
  );
}
