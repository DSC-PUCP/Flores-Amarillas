import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Flower,
  Heart,
  Link as LinkIcon,
  Share2,
  Sparkles,
  Stars,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { TemplateConfig, TemplateForm } from '@/core/models/template';
import type { TemplateSlideProps } from '../../types';

export type TemplateData = {
  personA: string;
  personB: string;
  image: string | null;
  timelinePhotos?: string[];
  message: string;
  startDate: Date;
};

export const plantillaGratuitaForm = [
  {
    title: 'Protagonistas',
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
        max_length: 25,
        label: 'Su nombre',
        type: 'string',
        required: true,
      },
      {
        name: 'startDate',
        label: '¿Cuándo comenzó su historia?',
        type: 'date',
        required: true,
      },
    ],
  },
  {
    title: 'El mensaje',
    fields: [
      {
        name: 'message',
        label: 'Escribe tu carta',
        max_length: 250,
        type: 'string',
        required: true,
      },
    ],
  },
  {
    title: 'Recuerdos',
    fields: [
      {
        name: 'image',
        label: 'Imagen de foto de portada',
        type: 'image',
        required: true,
      },
      {
        name: 'timelinePhotos',
        label: 'Timeline de fotos',
        type: 'array',
        item_type: 'image',
        required: false,
      },
    ],
  },
] satisfies TemplateForm;

// Internal component for floating particles (Petals/Hearts)
const FloatingParticles: React.FC<{ color: string }> = ({ color }) => {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <div
          key={i}
          className={`absolute animate-float-fade ${color}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random() * 0.5 + 0.2,
            transform: `scale(${Math.random() * 0.5 + 0.5})`,
          }}
        >
          {i % 2 === 0 ? (
            <Heart size={20} fill="currentColor" />
          ) : (
            <Flower size={20} />
          )}
        </div>
      ))}
    </div>
  );
};

export function PlantillaGratuita({ templateData }: TemplateSlideProps) {
  const data = templateData as TemplateData;

  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false); // For animation state
  const [imageLoaded, setImageLoaded] = useState(false); // Track if main image is loaded
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Timeline scroll ref
  const timelineRef = useRef<HTMLDivElement>(null);

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = 280;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Theme default configuration
  const theme = {
    accent: 'text-pink-600',
    bgAccent: 'bg-pink-600',
    border: 'border-pink-200',
    particleColor: 'text-pink-400/30',
    shadow: 'shadow-pink-900/40',
    icon: Sparkles,
  };
  const ThemeIcon = theme.icon;

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(data.startDate).getTime();
      const now = new Date().getTime();
      const diff = now - start;

      if (diff < 0) return;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [data.startDate]);

  const handleOpen = () => {
    setIsOpening(true);
    
    // Pre-load the main image before opening
    if (data.image) {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        setTimeout(() => {
          setIsOpen(true);
          setIsOpening(false);
        }, 800);
      };
      img.onerror = () => {
        // If image fails to load, still open after timeout
        setTimeout(() => {
          setIsOpen(true);
          setIsOpening(false);
        }, 800);
      };
      img.src = data.image;
    } else {
      // No image, just open normally
      setTimeout(() => {
        setIsOpen(true);
        setIsOpening(false);
      }, 800);
    }
  };

  // --- Logic for Sharing and Copying ---

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const getShareLinks = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `Para ${data.personB}, una dedicatoria especial de ${data.personA} ❤️`
    );

    return {
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
  };

  const links = getShareLinks();

  // --- RENDER: ENVELOPE (CLOSED) ---
  if (!isOpen) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-950 via-pink-900 to-fuchsia-950 overflow-hidden relative`}
      >
        <FloatingParticles color="text-white/20" />

        <div
          onClick={handleOpen}
          className={`cursor-pointer transform transition-all duration-700 ${isOpening ? 'scale-150 opacity-0 translate-y-20' : 'hover:scale-105 animate-float'}`}
        >
          {/* Envelope Body */}
          <div className="relative w-[320px] h-[220px] md:w-[400px] md:h-[280px] bg-[#fdfbf7] shadow-2xl rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
            {/* Flap Triangles (CSS Art) */}
            <div className="absolute top-0 left-0 w-0 h-0 border-l-[160px] md:border-l-[200px] border-l-transparent border-t-[140px] md:border-t-[160px] border-t-slate-100/50 border-r-[160px] md:border-r-[200px] border-r-transparent z-10 pointer-events-none filter drop-shadow-sm"></div>
            <div className="absolute top-0 left-0 w-0 h-0 border-l-[160px] md:border-l-[200px] border-l-transparent border-b-[110px] md:border-b-[140px] border-b-slate-200 border-r-[160px] md:border-r-[200px] border-r-transparent z-20"></div>

            {/* Wax Seal */}
            <div className="z-30 relative group">
              <div
                className={`w-16 h-16 rounded-full ${theme.bgAccent} shadow-lg flex items-center justify-center border-4 border-white/20 ring-4 ring-black/5`}
              >
                <Heart className="text-white w-8 h-8 fill-current animate-pulse-slow" />
              </div>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-white/90 font-bold tracking-widest text-sm bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                ABRIR CARTA
              </div>
            </div>

            {/* Address / To */}
            <div className="absolute bottom-6 font-script text-2xl text-slate-400 z-30">
              Para: {data.personB}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: OPEN DEDICATION ---
  return (
    <div
      className={`min-h-screen relative flex flex-col items-center py-12 px-4 md:px-8 bg-gradient-to-br from-pink-950 via-pink-900 to-fuchsia-950 overflow-x-hidden selection:bg-rose-500 selection:text-white`}
    >
      <FloatingParticles color={theme.particleColor} />

      {/* Main Container - Paper Texture */}
      <div
        className={`w-full max-w-3xl relative z-10 animate-[fadeIn_1.5s_ease-out]`}
      >
        {/* Decorative Top Flourish */}
        <div className="flex justify-center mb-[-20px] relative z-20">
          <div
            className={`bg-white text-slate-900 px-8 py-2 rounded-t-2xl shadow-lg border-t border-x ${theme.border} flex items-center gap-2`}
          >
            <ThemeIcon className={`w-5 h-5 ${theme.accent}`} />
            <span className="font-serif italic text-sm tracking-widest uppercase">
              Love Story
            </span>
            <ThemeIcon className={`w-5 h-5 ${theme.accent}`} />
          </div>
        </div>

        <div
          className={`bg-[#fffbf7] rounded-3xl overflow-hidden ${theme.shadow} shadow-2xl relative border-8 border-white/50 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]`}
        >
          {/* Inner Border decoration */}
          <div
            className={`absolute inset-4 border border-dashed ${theme.border} rounded-2xl pointer-events-none z-0 opacity-50`}
          ></div>

          {/* Header Photo Section */}
          <div className="relative pt-12 px-8 md:px-16 pb-8 text-center z-10">
            {/* The Photo Frame */}
            <div className="relative inline-block transform rotate-1 hover:rotate-0 transition-transform duration-700 duration-500 ease-in-out mb-8">
              <div className="absolute inset-0 bg-black/20 translate-y-4 translate-x-4 blur-md rounded-lg"></div>
              <div className="relative bg-white p-3 pb-8 md:p-4 md:pb-12 shadow-xl rounded-sm">
                <div className="relative overflow-hidden aspect-[4/5] w-64 md:w-80 bg-slate-100">
                  {data.image ? (
                    <>
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 animate-pulse">
                          <Heart size={48} />
                        </div>
                      )}
                      <img
                        src={data.image}
                        alt="Us"
                        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Heart size={48} />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-1 md:bottom-2 left-0 right-0 text-center">
                  <p
                    className={`font-script text-2xl md:text-3xl font-bold ${theme.accent}`}
                    style={{
                      textShadow: '2px 2px 3px white, -2px -2px 3px white, 2px -2px 3px white, -2px 2px 3px white, 0 0 8px white'
                    }}
                  >
                    {data.personA} & {data.personB}
                  </p>
                </div>
              </div>
              {/* Sticker/Pin */}
              <div className="absolute -top-3 -right-3 text-yellow-400 drop-shadow-md animate-pulse">
                <Stars size={32} fill="currentColor" />
              </div>
            </div>

            {/* The Message */}
            <div className="relative mt-4">
              <ThemeIcon
                className={`w-8 h-8 ${theme.accent} mx-auto mb-4 opacity-50`}
              />
              <h1 className="font-serif text-3xl md:text-4xl text-slate-800 font-bold mb-6">
                Feliz San Valentín
              </h1>
              <p className="font-serif text-lg md:text-xl text-slate-600 leading-loose italic max-w-xl mx-auto whitespace-pre-wrap break-words">
                "{data.message}"
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 py-4 opacity-30">
            <div className={`h-px w-16 ${theme.bgAccent}`}></div>
            <Heart size={16} className={theme.accent} fill="currentColor" />
            <div className={`h-px w-16 ${theme.bgAccent}`}></div>
          </div>

          {/* Stats Section */}
          <div className="bg-white/50 backdrop-blur-sm py-8 px-4">
            <h3 className="text-center font-sans text-xs uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center justify-center gap-2">
              <Calendar size={14} /> Tiempo Compartido
            </h3>
            <div className="grid grid-cols-4 gap-2 md:gap-8 max-w-lg mx-auto">
              {[
                { label: 'Días', value: timeTogether.days },
                { label: 'Horas', value: timeTogether.hours },
                { label: 'Min', value: timeTogether.minutes },
                { label: 'Seg', value: timeTogether.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={`w-14 h-14 md:w-20 md:h-20 rounded-full bg-white border ${theme.border} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span
                      className={`text-xl md:text-3xl font-bold ${theme.accent} font-serif`}
                    >
                      {item.value}
                    </span>
                  </div>
                  <span className="mt-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-6 text-sm text-slate-400 font-light italic">
              Desde el{' '}
              {new Date(data.startDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Timeline - Film Strip Style */}
          {Array.isArray(data.timelinePhotos) &&
            data.timelinePhotos.length > 0 && (
              <div className="py-10 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-repeat-x bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMzMzIiAvPjwvc3ZnPg==')] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-repeat-x bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMzMzIiAvPjwvc3ZnPg==')] opacity-20"></div>

                <h3 className="text-center font-script text-3xl mb-8 text-rose-400">
                  Nuestros momentos
                </h3>

                <div className="relative">
                  {/* Left Navigation Button */}
                  <button
                    onClick={() => scrollTimeline('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-rose-600 rounded-full p-2 shadow-lg backdrop-blur-sm transition-all opacity-60 hover:opacity-100"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  {/* Right Navigation Button */}
                  <button
                    onClick={() => scrollTimeline('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-rose-600 rounded-full p-2 shadow-lg backdrop-blur-sm transition-all opacity-60 hover:opacity-100"
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={24} />
                  </button>

                  <div 
                    ref={timelineRef}
                    className="flex gap-6 overflow-x-auto px-8 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  >
                    {data.timelinePhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="snap-center flex-shrink-0 relative transform even:rotate-1 odd:-rotate-1 hover:rotate-0 transition-transform duration-300"
                    >
                      <div className="bg-white p-2 pb-8 shadow-lg w-48 md:w-56">
                        <img
                          src={photo}
                          className="w-full h-48 object-cover filter sepia-[0.2]"
                          alt="Memory"
                        />
                        <div className="absolute bottom-3 right-4 text-slate-400">
                          <Heart size={12} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            )}

          {/* Footer Actions */}
          {
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col items-center gap-4">
              <p className="font-script text-xl text-slate-400">
                Con todo mi amor, {data.personA}
              </p>
              <div className="flex gap-3 mt-2">
                <Button
                  onClick={() => setShowShareModal(true)}
                  size="sm"
                  className={`shadow-none ${theme.bgAccent} text-white`}
                >
                  <Share2 size={16} className="mr-2" /> Compartir
                </Button>

                <Button
                  variant={copySuccess ? 'success' : 'outline'}
                  size="sm"
                  onClick={handleCopyLink}
                  className={`transition-all duration-300 ${copySuccess ? 'border-green-500 text-green-600 bg-green-50' : ''}`}
                >
                  {copySuccess ? (
                    <Check size={16} className="mr-2" />
                  ) : (
                    <Copy size={16} className="mr-2" />
                  )}
                  {copySuccess ? '¡Enlace Copiado!' : 'Copiar Link'}
                </Button>
              </div>
            </div>
          }
        </div>

        {
          <div className="text-center py-6">
            <a
              href="/#/"
              className="text-white/60 hover:text-white text-xs font-medium tracking-wider uppercase transition-colors"
            >
              Creado gratis con LoveDedicatorias
            </a>
          </div>
        }
      </div>

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowShareModal(false)}
          ></div>

          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-[scaleIn_0.3s_ease-out] border-2 border-rose-100">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full text-rose-500 mb-3">
                <Share2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Comparte el Amor
              </h3>
              <p className="text-sm text-slate-500">
                Hazle llegar este detalle especial.
              </p>
            </div>

            {/* Social Icons Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <a
                href={links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 transition-colors gap-2 group"
              >
                {/* WhatsApp SVG Icon */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-8 h-8 fill-current group-hover:scale-110 transition-transform"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="font-bold text-sm">WhatsApp</span>
              </a>

              <a
                href={links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors gap-2 group"
              >
                {/* Facebook SVG Icon */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-8 h-8 fill-current group-hover:scale-110 transition-transform"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="font-bold text-sm">Facebook</span>
              </a>
            </div>

            {/* Manual Copy Section (Acts as Instagram helper too) */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400 mb-1 flex justify-between">
                <span>Enlace de la carta</span>
                <span className="text-rose-500 font-medium">
                  Perfecto para Instagram
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`p-2 rounded-lg transition-colors ${copySuccess ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                >
                  {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const plantillaGratuitaConfig = {
  templateForm: plantillaGratuitaForm,
  component: PlantillaGratuita,
} satisfies TemplateConfig;
