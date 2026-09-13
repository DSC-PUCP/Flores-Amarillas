import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  MailOpen,
  Share2,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { TemplateSlideProps } from '../../types';

const PETAL_ANGLES = Array.from({ length: 12 }, (_, index) => index * 30);

function LittleFlower({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <g fill="#FFD329">
        {PETAL_ANGLES.map((angle) => (
          <ellipse
            key={angle}
            cx="50"
            cy="25"
            rx="10"
            ry="23"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="19" fill="#754921" />
      <circle cx="50" cy="50" r="12" fill="#9B652B" />
    </svg>
  );
}

function Bouquet({ className = '' }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`relative ${className}`} aria-hidden="true">
        <span className="absolute bottom-[4%] left-[49%] h-[60%] w-2 rotate-[-19deg] rounded-full bg-[#568044]" />
        <span className="absolute bottom-[4%] left-[49%] h-[64%] w-2 rotate-[19deg] rounded-full bg-[#568044]" />
        <span className="absolute bottom-[4%] left-[49%] h-[70%] w-2 rounded-full bg-[#568044]" />
        <LittleFlower className="absolute left-[2%] top-[24%] w-[51%] -rotate-12" />
        <LittleFlower className="absolute right-[1%] top-[20%] w-[53%] rotate-12" />
        <LittleFlower className="absolute left-[24%] top-[4%] w-[53%]" />
      </div>
    );
  }

  return (
    <img
      src="/images/sunflower-bouquet.webp"
      alt=""
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

function parseStartDate(value: unknown): number | null {
  if (typeof value !== 'string' && !(value instanceof Date)) return null;
  // Form dates are calendar dates. Parse at local midnight to avoid losing a day.
  const date =
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);
  const timestamp = date.getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function TimeTogether({ startDate }: { startDate: number }) {
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      setSeconds(Math.max(0, Math.floor((Date.now() - startDate) / 1000)));
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [startDate]);

  const values = [
    {
      label: 'días',
      value: seconds === null ? null : Math.floor(seconds / 86400),
    },
    {
      label: 'horas',
      value: seconds === null ? null : Math.floor((seconds % 86400) / 3600),
    },
    {
      label: 'minutos',
      value: seconds === null ? null : Math.floor((seconds % 3600) / 60),
    },
    { label: 'segundos', value: seconds === null ? null : seconds % 60 },
  ];

  return (
    <section
      data-editor-scene="intro"
      className="rounded-[28px] bg-[#183E32] px-5 py-9 text-[#FFF8D7] sm:px-9"
    >
      <p className="mb-3 text-[10px] font-bold tracking-[0.22em] uppercase text-[#FFD329]">
        Desde que empezó nuestra historia
      </p>
      <h2 className="font-display text-3xl leading-tight sm:text-4xl">
        Y siguen floreciendo los días.
      </h2>
      <div className="mt-7 grid grid-cols-4 gap-2 sm:gap-4">
        {values.map(({ label, value }) => (
          <div key={label} className="min-w-0 text-center">
            <p className="font-display text-[clamp(1.35rem,5vw,2.75rem)] leading-none tabular-nums">
              {value === null ? '—' : String(value).padStart(2, '0')}
            </p>
            <p className="mt-2 text-[10px] text-[#FFF8D7]/70 sm:text-xs">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PhotoMemories({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const activeIndex = Math.min(index, photos.length - 1);
  const activePhoto = photos[activeIndex];

  return (
    <section
      data-editor-scene="photos"
      aria-label="Nuestros recuerdos"
      className="min-w-0"
    >
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#597157]">
            Pequeños momentos, grandes recuerdos
          </p>
          <h2 className="font-display text-3xl sm:text-4xl">
            Mi lugar favorito.
          </h2>
        </div>
        {photos.length > 1 && (
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() =>
                setIndex((activeIndex - 1 + photos.length) % photos.length)
              }
              aria-label="Foto anterior"
              className="grid size-10 place-items-center rounded-full border border-[#183E32]/20 hover:bg-[#FFD329] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIndex((activeIndex + 1) % photos.length)}
              aria-label="Foto siguiente"
              className="grid size-10 place-items-center rounded-full border border-[#183E32]/20 hover:bg-[#FFD329] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      <figure className="rotate-[-1deg] rounded-sm bg-white p-3 shadow-[0_12px_35px_-18px_#183E3240] sm:p-4">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F3EDCB]">
          {activePhoto === failedPhoto ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 text-center">
              <LittleFlower className="size-20" />
              <p className="text-sm text-[#597157]">
                Este recuerdo no pudo cargar. Intenta abrirlo de nuevo más
                tarde.
              </p>
            </div>
          ) : (
            <img
              key={activePhoto}
              src={activePhoto}
              alt={`Nuestro recuerdo ${activeIndex + 1} de ${photos.length}`}
              className="h-full w-full object-cover"
              onError={() => setFailedPhoto(activePhoto)}
              loading="lazy"
            />
          )}
        </div>
        <figcaption className="flex items-center justify-between gap-3 px-2 pt-4 pb-2 text-[#597157]">
          <span className="font-display text-lg italic">Contigo, aquí.</span>
          <span className="text-xs tabular-nums" aria-live="polite">
            {activeIndex + 1} / {photos.length}
          </span>
        </figcaption>
      </figure>
    </section>
  );
}

export function FlowerDedication({
  templateData,
  isPreview = true,
}: TemplateSlideProps) {
  const compactPreview = isPreview && templateData.compactPreview === true;
  const personA =
    typeof templateData.personA === 'string' && templateData.personA.trim()
      ? templateData.personA
      : 'Alguien que te quiere';
  const personB =
    typeof templateData.personB === 'string' && templateData.personB.trim()
      ? templateData.personB
      : 'ti';
  const message =
    typeof templateData.message === 'string' ? templateData.message : '';
  const coverPhoto =
    typeof templateData.image === 'string' && templateData.image.trim()
      ? templateData.image
      : null;
  const memories = Array.isArray(templateData.timelinePhotos)
    ? templateData.timelinePhotos.filter(
        (photo): photo is string =>
          typeof photo === 'string' && photo.trim().length > 0
      )
    : [];
  const photos = [
    ...new Set([...(coverPhoto ? [coverPhoto] : []), ...memories]),
  ];
  const startDate = parseStartDate(templateData.startDate);
  const editor = isPreview && templateData.editorPreview === true;
  const editorScene =
    typeof templateData.editorScene === 'string'
      ? templateData.editorScene
      : 'cover';
  const editing = editor && editorScene !== 'review';
  const [opened, setIsOpen] = useState(false);
  const isOpen = editing ? editorScene !== 'cover' : opened;
  const [shareStatus, setShareStatus] = useState('');
  const [shareBusy, setShareBusy] = useState(false);
  const [manualLink, setManualLink] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const letterRef = useRef<HTMLHeadingElement>(null);
  const envelopeRef = useRef<HTMLButtonElement>(null);
  const hasOpened = useRef(false);
  const letterId = useId();
  const linkId = useId();

  useEffect(() => {
    if (
      editor &&
      editorScene === 'review' &&
      typeof templateData.editorRevision === 'number'
    ) {
      setIsOpen(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [editor, editorScene, templateData.editorRevision]);
  useEffect(() => {
    if (!editing || !isOpen || typeof templateData.editorRevision !== 'number')
      return;
    const node = document.querySelector<HTMLElement>(
      `[data-editor-scene="${(editorScene === 'photos' && !photos.length) || (editorScene === 'intro' && startDate === null) ? 'letter' : editorScene}"]`
    );
    window.scrollTo({
      top: node ? node.getBoundingClientRect().top + window.scrollY - 16 : 0,
      behavior: 'instant',
    });
  }, [
    editing,
    isOpen,
    editorScene,
    templateData.editorRevision,
    photos.length,
    startDate,
  ]);

  useEffect(() => {
    if (editor) return;
    if (isOpen) {
      hasOpened.current = true;
      letterRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (hasOpened.current) {
      envelopeRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [isOpen, editor]);

  const copyLink = async () => {
    if (isPreview || shareBusy) return;
    const url = window.location.href;
    setShareBusy(true);
    setHasCopied(false);
    setShareStatus('');
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(url);
      setHasCopied(true);
      setManualLink('');
      setShareStatus('Enlace copiado. Ya puedes enviarlo a quien quieras.');
    } catch {
      setManualLink(url);
      setShareStatus(
        'No se pudo copiar automáticamente. Selecciona el enlace para copiarlo.'
      );
    } finally {
      setShareBusy(false);
    }
  };

  const shareGift = async () => {
    if (isPreview || shareBusy) return;
    if (!navigator.share) {
      await copyLink();
      return;
    }
    setShareBusy(true);
    setShareStatus('');
    try {
      await navigator.share({
        title: `Flores amarillas para ${personB}`,
        text: `${personA} te ha dedicado unas flores amarillas.`,
        url: window.location.href,
      });
      setShareStatus('Dedicatoria compartida. Que siga floreciendo.');
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        setShareStatus(
          'No se pudo compartir. Puedes copiar el enlace e intentarlo de nuevo.'
        );
      }
    } finally {
      setShareBusy(false);
    }
  };

  return (
    <div className="relative min-h-svh overflow-x-clip bg-[#FFF8D7] font-sans text-[#183E32] selection:bg-[#FFD329] selection:text-[#183E32]">
      {isOpen ? (
        <div className="relative mx-auto max-w-5xl px-5 py-6 sm:px-9 sm:py-9">
          <div className="mb-8 flex items-center justify-between gap-3">
            {!editing && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[#597157] hover:text-[#183E32] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
              >
                <ArrowLeft size={15} />
                Volver al sobre
              </button>
            )}
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#597157]">
              Un detalle para ti
            </span>
          </div>

          <div className="mb-9 text-center sm:mb-12">
            <p className="mb-3 text-[10px] font-bold tracking-[0.22em] uppercase text-[#597157]">
              Hay personas que son primavera
            </p>
            <h1
              ref={letterRef}
              id={letterId}
              tabIndex={-1}
              className="font-display text-[clamp(2.5rem,7vw,4.8rem)] leading-[1.06] break-words outline-none"
            >
              Y tú eres la mía, <span className="italic">{personB}.</span>
            </h1>
          </div>

          <div className="grid items-start gap-8 md:grid-cols-[1.05fr_1fr] md:gap-10">
            <article
              data-editor-scene="letter"
              className="relative min-w-0 rounded-[4px_28px_28px_28px] bg-[#FFFEF7] p-6 shadow-[0_15px_60px_-35px_#183E3250] sm:p-9"
            >
              <div className="mb-7 flex items-center justify-between">
                <MailOpen
                  size={22}
                  strokeWidth={1.4}
                  className="text-[#6D836A]"
                />
                <LittleFlower className="size-12 rotate-12" />
              </div>
              <p className="mb-5 font-display text-2xl italic">
                Para {personB},
              </p>
              <p className="text-base leading-[1.9] whitespace-pre-wrap break-words text-[#415542] sm:text-lg">
                {message ||
                  (editing
                    ? 'Tu dedicatoria aparecerá aquí mientras la escribes.'
                    : '')}
              </p>
              <div className="mt-8 border-t border-[#183E32]/10 pt-6">
                <p className="mb-1 text-xs text-[#597157]">
                  Con todo mi cariño,
                </p>
                <p className="font-display text-2xl italic break-words">
                  {personA}
                </p>
              </div>
              <div className="mt-7 flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#597157]">
                <Heart size={13} fill="#F17B62" stroke="#F17B62" />
                Estas flores son para ti
              </div>
            </article>

            <div className="min-w-0 space-y-8">
              {photos.length > 0 ? (
                <PhotoMemories photos={photos} />
              ) : (
                <div className="relative flex min-h-64 flex-col items-center rounded-[28px] bg-[#FFD329]/30 px-6 py-5 text-center">
                  <Bouquet className="h-56 w-56" />
                  <p className="font-display text-2xl italic">
                    Un poco de sol, solo para ti.
                  </p>
                </div>
              )}
              {startDate !== null && <TimeTogether startDate={startDate} />}
            </div>
          </div>

          {!isPreview && (
            <section
              aria-label="Compartir dedicatoria"
              className="mx-auto mt-12 max-w-lg text-center"
            >
              <p className="mb-4 font-display text-2xl">
                El cariño se comparte.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  disabled={shareBusy}
                  onClick={shareGift}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#183E32] px-6 text-sm font-semibold text-[#FFF8D7] hover:bg-[#285642] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
                >
                  <Share2 size={16} /> Compartir
                </button>
                <button
                  type="button"
                  disabled={shareBusy}
                  onClick={copyLink}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#183E32]/20 px-6 text-sm font-semibold hover:bg-[#FFD329] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
                >
                  {hasCopied ? <Check size={16} /> : <Copy size={16} />}
                  {hasCopied ? 'Copiado' : 'Copiar enlace'}
                </button>
              </div>
              <output className="mt-3 block text-sm leading-relaxed text-[#597157]">
                {shareStatus}
              </output>
              {manualLink && (
                <div className="mt-3 text-left">
                  <label
                    htmlFor={linkId}
                    className="mb-2 block text-xs font-semibold"
                  >
                    Enlace de tu dedicatoria
                  </label>
                  <input
                    id={linkId}
                    value={manualLink}
                    readOnly
                    onFocus={(event) => event.currentTarget.select()}
                    className="w-full rounded-xl border border-[#183E32]/30 bg-white px-3 py-3 text-xs focus:outline-2 focus:outline-[#183E32]"
                  />
                </div>
              )}
            </section>
          )}
          <p className="mt-12 pb-3 text-center text-[10px] font-semibold tracking-[0.18em] uppercase text-[#597157]">
            Hecho con cariño · Dedicatorias en Flor
          </p>
        </div>
      ) : (
        <div
          className={`relative flex min-h-svh flex-col items-center justify-center text-center ${
            compactPreview ? 'px-4 py-4' : 'px-5 py-10 sm:py-14'
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(#B5A555_0.8px,transparent_0.8px)] [background-size:22px_22px]"
          />
          <div
            aria-hidden="true"
            className="absolute -left-28 top-8 size-64 rounded-full bg-[#FFD329]/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -right-24 bottom-4 size-64 rounded-full bg-[#F17B62]/15 blur-3xl"
          />
          <div className="relative z-10 w-full max-w-xl">
            <p
              className={`font-bold uppercase text-[#597157] break-words ${
                compactPreview
                  ? 'mb-2 text-[9px] tracking-[0.12em]'
                  : 'mb-4 text-[10px] tracking-[0.2em]'
              }`}
            >
              Una sorpresa de {personA}
            </p>
            <h1
              className={`font-display leading-[1.03] break-words ${
                compactPreview
                  ? 'text-[32px]'
                  : 'text-[clamp(2.7rem,9vw,4.8rem)]'
              }`}
            >
              <span
                className={
                  compactPreview && personB.length > 18 ? 'text-2xl' : ''
                }
              >
                {personB},
              </span>
              <br />
              <span className="italic">te llegaron flores.</span>
            </h1>
            <p
              className={`mx-auto max-w-xs leading-relaxed text-[#597157] ${
                compactPreview ? 'mt-2.5 text-[11px]' : 'mt-5 text-sm'
              }`}
            >
              {compactPreview ? (
                'Un poco de sol, solo para ti.'
              ) : (
                <>
                  Amarillas, como los días bonitos.
                  <br />Y con algo que quiero decirte.
                </>
              )}
            </p>

            <button
              ref={envelopeRef}
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label={`Abrir dedicatoria para ${personB}`}
              aria-expanded={false}
              className={`group relative mx-auto block w-full rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#183E32] ${
                compactPreview
                  ? 'mt-2 h-[180px] max-w-[248px]'
                  : 'mt-4 h-[290px] max-w-[350px] sm:h-[330px] sm:max-w-[390px]'
              }`}
            >
              <Bouquet className="absolute inset-x-[10%] top-0 h-[83%] w-[80%] origin-bottom motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:-translate-y-3 motion-safe:group-hover:rotate-[-3deg]" />
              <span className="absolute right-[4%] bottom-1 left-[4%] h-[53%] rounded-[6px_6px_16px_16px] bg-[#EEC541] shadow-[0_22px_35px_-20px_#82681870]" />
              <span className="absolute right-[4%] bottom-1 left-[4%] h-[53%] rounded-b-2xl bg-[#FFECA2] [clip-path:polygon(0_0,50%_62%,100%_0,100%_100%,0_100%)]" />
              <span className="absolute right-[4%] bottom-1 left-[4%] h-[53%] rounded-b-2xl bg-[#FFE798] [clip-path:polygon(0_100%,50%_30%,100%_100%)]" />
              <span
                className={`absolute bottom-[15%] left-1/2 grid -translate-x-1/2 place-items-center rounded-full bg-[#F17B62] text-[#FFF8D7] shadow-[0_4px_0_#D66E58] motion-safe:transition-transform motion-safe:group-hover:scale-110 ${compactPreview ? 'size-10' : 'size-14 sm:size-16'}`}
              >
                <Heart
                  size={compactPreview ? 18 : 24}
                  strokeWidth={1.4}
                  fill="currentColor"
                />
              </span>
              <span
                className={`absolute inset-x-[8%] font-semibold uppercase text-[#796423] break-words ${
                  compactPreview
                    ? 'bottom-3 text-[8px] tracking-[0.1em]'
                    : 'bottom-5 text-[10px] tracking-[0.17em]'
                }`}
              >
                {compactPreview
                  ? 'Con todo mi cariño'
                  : `Para ${personB}, con cariño`}
              </span>
            </button>
            <p
              className={`inline-flex items-center gap-2 font-semibold ${compactPreview ? 'mt-3 text-[11px]' : 'mt-7 text-xs'}`}
            >
              {compactPreview
                ? 'Toca el sobre para abrirlo'
                : 'Toca el sobre y descubre tu sorpresa'}
              <ArrowUpRight size={compactPreview ? 13 : 16} />
            </p>
            {!compactPreview && (
              <p className="mt-7 text-[9px] font-semibold tracking-[0.17em] uppercase text-[#6F7D5A]">
                Flores amarillas · Dedicatorias en Flor
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
