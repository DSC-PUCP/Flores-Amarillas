import { Heart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { TemplateSlideProps } from '../../types';

type Plantilla2Data = {
  personA: string;
  personB: string;
  message: string;
  startDate: string;
  themeId: string;
  musicUrl?: string;
  image?: string;
  timelinePhotos?: string[];
};

export function Plantilla2({ templateData }: TemplateSlideProps) {
  const data = templateData as Plantilla2Data;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Pre-compute heart properties so they don't change on re-render
  const hearts = useMemo(() => {
    const colors = ['#fecdd3', '#fda4af', '#fb7185', '#f472b6', '#f9a8d4', '#fee2e2', '#fbbf24', '#ffffff'];
    return Array.from({ length: 60 }, (_, i) => ({
      left: Math.random() * 100,
      size: 14 + Math.random() * 28,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
      color: colors[i % colors.length],
    }));
  }, []);

  useEffect(() => {
    // Ensure at least 2.5 seconds of animation
    const timer = setTimeout(() => setMinTimeElapsed(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!data.image) {
      setImageLoaded(true);
      return;
    }

    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true);
    img.src = data.image;
  }, [data.image]);

  const readyToShow = imageLoaded && minTimeElapsed;

  return (
    <>
      {/* Main content - always rendered */}
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-red-100 flex items-center justify-center p-8">
        <div className="max-w-xl w-full bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl shadow-2xl p-8 text-center border-2 border-rose-300">
          <h1 className="text-3xl font-bold text-rose-600 mb-4">Te amo ❤️</h1>
          <div className="mb-6 px-2">
            <div className="flex flex-wrap items-center justify-center gap-2 text-rose-500">
              <span className="font-semibold text-rose-600 break-words">
                {data.personA}
              </span>
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500 shrink-0" />
              <span className="font-semibold text-rose-600 break-words">
                {data.personB}
              </span>
            </div>
          </div>
          {data.image && (
            <img
              src={data.image}
              alt="Main"
              className="w-auto h-auto max-w-full max-h-72 object-contain rounded-lg mb-6 opacity-90 border-2 border-rose-300 mx-auto"
            />
          )}
          <p className="text-rose-700 italic break-words">"{data.message}"</p>
        </div>
      </div>

      {/* Loading screen overlay with hearts - fades out when ready */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-pink-200 via-rose-200 to-red-200 overflow-hidden transition-opacity duration-700 ${
          readyToShow ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <style>
          {`
            @keyframes floatHearts {
              0% {
                transform: translateY(0) rotate(0deg) scale(0.8);
                opacity: 0;
              }
              5% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                transform: translateY(-110vh) rotate(20deg) scale(1.1);
                opacity: 0;
              }
            }
          `}
        </style>
        {hearts.map((heart, index) => (
          <Heart
            key={index}
            className="absolute bottom-0"
            style={{
              left: `${heart.left}%`,
              width: `${heart.size}px`,
              height: `${heart.size}px`,
              color: heart.color,
              animation: `floatHearts ${heart.duration}s ease-out ${heart.delay}s infinite`,
              filter: 'drop-shadow(0 4px 8px rgba(190, 24, 93, 0.3))',
            }}
            fill="currentColor"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-300/40 via-transparent to-rose-100/30" />
        <div className="relative z-10 text-center px-4">
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500 mx-auto mb-3 animate-pulse" />
          <p className="text-rose-700 font-semibold text-lg drop-shadow-sm">
            Esto es para ti 
          </p>
        </div>
      </div>
    </>
  );
}
