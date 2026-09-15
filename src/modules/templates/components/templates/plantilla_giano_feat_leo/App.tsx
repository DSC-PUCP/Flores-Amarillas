import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TemplateConfig, TemplateForm } from '@/core/models/template';
import { cn } from '@/lib/utils';
import { useSongClips } from '@/modules/music/hooks/useSongClips';
import { readSongClips } from '@/modules/music/song-clip';
import type { TemplateSlideProps } from '@/modules/templates/types';
import { Butterflies, Pollen } from './components/Ambience';
import { Coupon } from './components/Coupon';
import { Cover } from './components/Cover';
import { Finale } from './components/Finale';
import { Gallery } from './components/Gallery';
import { Hero } from './components/Hero';
import { Letter } from './components/Letter';
import { MusicBar, useLegacyAudio } from './components/MusicBar';
import { PetalRain } from './components/PetalRain';
import { ReasonsFlower } from './components/ReasonsFlower';
import { SongSection } from './components/SongSection';
import { type PremiumScene, SceneDeck } from './components/scene-deck';
import { DEFAULT_CLOSING_LINE, readPremiumData } from './data';
import { GIFT_MASCOTS, type GiftMascot } from './mascots';
import styles from './premium.module.css';
import { useMood } from './useMood';

export const plantillaGianoFeatLeoForm = [
  {
    title: 'La portada',
    description:
      'Los nombres y el animalito que entrega las flores al abrir el regalo.',
    previewScene: 'cover',
    fields: [
      {
        name: 'personA',
        label: 'Tu nombre',
        type: 'string',
        max_length: 25,
        required: true,
      },
      {
        name: 'personB',
        label: 'Su nombre',
        type: 'string',
        max_length: 25,
        required: true,
      },
      {
        name: 'mascot',
        label: '¿Quién entregará tus flores?',
        type: 'choice',
        appearance: 'mascot',
        options: [...GIFT_MASCOTS],
        default: 'rabbit',
        required: false,
      },
    ],
  },
  {
    title: 'La presentación',
    description:
      'El saludo inicial y, si eliges una fecha, el contador de su historia.',
    previewScene: 'intro',
    fields: [
      {
        name: 'startDate',
        label:
          '¿Cuándo empezó su historia? (opcional: el contador parte de ese día)',
        type: 'date',
        required: false,
      },
    ],
  },
  {
    title: 'Su canción',
    description:
      'El disco y los fragmentos que sonarán después de la presentación.',
    previewScene: 'song',
    fields: [
      {
        name: 'songs',
        label: 'Elige su canción y el fragmento que más les guste',
        type: 'music',
        max_songs: 3,
        max_clip_seconds: 90,
        required: false,
      },
    ],
  },
  {
    title: 'Su álbum',
    description:
      'La foto principal y los recuerdos de su carrusel, en el orden que elijas.',
    previewScene: 'photos',
    fields: [
      {
        name: 'image',
        label: 'Foto que abre el álbum (se verá completa)',
        type: 'image',
        required: false,
      },
      {
        name: 'timelinePhotos',
        label: 'Hasta 12 fotos más para su carrusel, en orden',
        item_max_length: 200,
        max_items: 12,
        type: 'array',
        item_type: 'image',
        required: false,
      },
    ],
  },
  {
    title: 'La carta',
    description: 'Tu dedicatoria dentro del sobre con sello.',
    previewScene: 'letter',
    fields: [
      {
        name: 'message',
        label: 'Escribe tu carta. Llegará dentro de un sobre con sello.',
        type: 'textarea',
        max_length: 1200,
        required: true,
      },
    ],
  },
  {
    title: 'Tus razones',
    description: 'La flor que descubre una razón en cada pétalo.',
    previewScene: 'reasons',
    fields: [
      {
        name: 'reasonsToLove',
        label:
          'Una razón por la que quieres a esa persona. Cada una será un pétalo.',
        type: 'array',
        item_type: 'string',
        item_label: 'razón',
        max_items: 6,
        item_max_length: 100,
        required: false,
      },
    ],
  },
  {
    title: 'Vale sorpresa',
    description: 'El vale para descubrir y las fotos que aparecen al rasparlo.',
    previewScene: 'coupon',
    fields: [
      {
        name: 'couponText',
        label:
          'Regálale un vale para raspar (ej. "Una cena a la luz de las velas")',
        type: 'string',
        max_length: 50,
        required: false,
      },
      {
        name: 'couponPhotos',
        label: 'Fotos del vale sorpresa (hasta 6, se descubren al raspar)',
        type: 'array',
        item_type: 'image',
        max_items: 6,
        required: false,
      },
    ],
  },
  {
    title: 'La despedida',
    description: 'La frase final junto a tu firma, al terminar el recorrido.',
    previewScene: 'finale',
    fields: [
      {
        name: 'closingLine',
        label: `Frase de despedida (si la dejas vacía: "${DEFAULT_CLOSING_LINE}")`,
        type: 'string',
        max_length: 80,
        required: false,
      },
    ],
  },
] satisfies TemplateForm;

/**
 * Plantilla Premium de Flores Amarillas. La clave `plantilla_giano_feat_leo`
 * está en la base de datos: no cambiarla aunque el diseño sea otro.
 */
export function PlantillaGianoFeatLeo({
  templateData,
  isPreview = true,
}: TemplateSlideProps) {
  const data = useMemo(() => readPremiumData(templateData), [templateData]);
  const editor = isPreview && templateData.editorPreview === true;
  const editorScene =
    typeof templateData.editorScene === 'string'
      ? templateData.editorScene
      : 'cover';
  const editing = editor && editorScene !== 'review';
  const rootRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(
    editor && editorScene !== 'cover' && editorScene !== 'review'
  );
  const [previewMascot, setPreviewMascot] = useState<GiftMascot | null>(null);
  const [songInView, setSongInView] = useState(false);
  const songKey = JSON.stringify(data.songs ?? null);
  const clips = useMemo(
    () => readSongClips(JSON.parse(songKey) as unknown),
    [songKey]
  );
  const music = useSongClips(clips);
  const legacy = useLegacyAudio(music.count === 0 ? data.musicUrl : null);
  const hasMusic = music.count > 0 || legacy.url !== null;
  const mood = useMood({
    root: rootRef,
    videoId: music.song?.videoId ?? null,
    playing: music.count > 0 ? music.playing : legacy.playing,
    lineIndex: music.lineIndex,
  });

  const pause = useRef(() => {});
  pause.current = () => {
    music.pause();
    legacy.pause();
  };
  useEffect(() => {
    if (!editor || typeof templateData.editorRevision !== 'number') return;
    setStarted(editorScene !== 'cover' && editorScene !== 'review');
    setSongInView(editorScene === 'song');
    if (editorScene === 'cover' || editorScene === 'review') pause.current();
  }, [editor, editorScene, templateData.editorRevision]);

  const open = () => {
    setStarted(true);
    // Tiene que ir dentro del toque para que suene en iPhone.
    if (music.count > 0) music.play();
    else legacy.play();
  };

  const scenes: PremiumScene[] = [
    {
      id: 'intro',
      label: 'Presentación',
      tone: 'paper',
      content: (
        <Hero
          from={data.from}
          to={data.to}
          startDate={data.startDate}
          started={started}
        />
      ),
    },
    ...(music.count > 0 || editing
      ? [
          {
            id: 'song',
            label: 'Su canción',
            tone: 'night' as const,
            content:
              music.count > 0 ? (
                <SongSection music={music} mood={mood} />
              ) : (
                <EditorEmpty text="Elige su canción para ver el disco y su música aquí." />
              ),
          },
        ]
      : []),
    ...(data.photos.length > 0 || editing
      ? [
          {
            id: 'photos',
            label: 'Álbum de fotos',
            tone: 'paper' as const,
            content: data.photos.length ? (
              <Gallery photos={data.photos} />
            ) : (
              <EditorEmpty text="Añade tus fotos para ver cómo queda su álbum." />
            ),
          },
        ]
      : []),
    ...(data.message || editing
      ? [
          {
            id: 'letter',
            label: 'La carta',
            tone: 'paper' as const,
            content: (
              <Letter
                message={data.message}
                from={data.from}
                to={data.to}
                previewOpen={editing}
              />
            ),
          },
        ]
      : []),
    ...(data.reasons.length > 0 || editing
      ? [
          {
            id: 'reasons',
            label: 'Las razones',
            tone: 'paper' as const,
            content: data.reasons.length ? (
              <ReasonsFlower reasons={data.reasons} from={data.from} />
            ) : (
              <EditorEmpty text="Escribe tus razones: cada una se convertirá en un pétalo." />
            ),
          },
        ]
      : []),
    ...(data.coupon || editing
      ? [
          {
            id: 'coupon',
            label: 'El vale sorpresa',
            tone: 'paper' as const,
            content: data.coupon ? (
              <Coupon
                text={data.coupon.text}
                images={data.coupon.images}
                from={data.from}
              />
            ) : (
              <EditorEmpty text="Escribe qué regalarás en el vale sorpresa para verlo aquí." />
            ),
          },
        ]
      : []),
    {
      id: 'finale',
      label: 'La despedida',
      tone: 'paper',
      content: (
        <Finale
          from={data.from}
          to={data.to}
          closingLine={data.closingLine}
          isPreview={isPreview}
        />
      ),
    },
  ];

  return (
    <div
      ref={rootRef}
      className={cn(styles.root, !started && 'h-svh overflow-hidden')}
    >
      <AnimatePresence>
        {!started && (
          <Cover
            key="cover"
            from={data.from}
            to={data.to}
            hasMusic={hasMusic}
            mascot={previewMascot ?? data.mascot}
            onMascotChange={
              isPreview && !templateData.compactPreview
                ? setPreviewMascot
                : undefined
            }
            onOpen={open}
          />
        )}
      </AnimatePresence>

      {started && (
        <>
          <PetalRain />
          <Pollen />
          <Butterflies />
        </>
      )}

      <MusicBar
        music={music}
        legacy={legacy}
        mood={mood}
        visible={started && !(music.count > 0 && songInView)}
      />

      {/* Montado desde el inicio, detrás de la portada: así el reproductor de
          YouTube ya está listo cuando tocan "Abrir mi regalo". */}
      <div inert={!started} aria-hidden={!started}>
        <SceneDeck
          scenes={scenes}
          scrollRef={deckRef}
          onSceneChange={(id) => setSongInView(id === 'song')}
          targetScene={
            editor
              ? editorScene === 'cover' || editorScene === 'review'
                ? 'intro'
                : editorScene
              : undefined
          }
          targetRevision={
            editor ? Number(templateData.editorRevision) : undefined
          }
        />
      </div>
    </div>
  );
}

function EditorEmpty({ text }: { text: string }) {
  return (
    <div className="grid min-h-svh place-items-center px-10 text-center">
      <p className="max-w-xs text-lg leading-relaxed text-[var(--mood-ink-soft)]">
        {text}
      </p>
    </div>
  );
}

export const plantillaGianoFeatLeoConfig = {
  templateForm: plantillaGianoFeatLeoForm,
  component: PlantillaGianoFeatLeo,
} satisfies TemplateConfig;
