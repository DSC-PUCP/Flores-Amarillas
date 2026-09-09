import { Calendar, Heart } from 'lucide-react';
import React from 'react';
import type { TemplateSlideProps } from '../../types';

type AmorEternoData = {
  personA: string;
  personB: string;
  message: string;
  startDate: string;
  themeId: string;
  image?: string;
  timelinePhotos: string[];
};

export function AmorEternoTemplate({ templateData }: TemplateSlideProps) {
  const data = templateData as AmorEternoData;
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-600 to-pink-500 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center">
        {/* Header */}
        <div className="mb-8">
          <Heart className="w-16 h-16 mx-auto text-rose-500 fill-rose-500 mb-4 animate-pulse" />
          <h1 className="font-script text-5xl text-rose-600 mb-2">
            Amor Eterno
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <span className="text-2xl">{data.personA}</span>
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-2xl">{data.personB}</span>
          </div>
        </div>

        {/* Image */}
        {data.image && (
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-rose-500/20 rounded-2xl transform rotate-2"></div>
            <img
              src={data.image}
              alt="Nosotros"
              className="relative w-full h-64 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Message */}
        <div className="mb-8 p-6 bg-rose-50 rounded-xl">
          <p className="font-serif text-lg italic text-slate-700 leading-relaxed">
            "{data.message}"
          </p>
        </div>

        {/* Date */}
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            Desde el{' '}
            {new Date(data.startDate).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Timeline Photos */}
        {data.timelinePhotos.length > 0 && (
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            {data.timelinePhotos.slice(0, 4).map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Momento ${idx + 1}`}
                className="w-20 h-20 object-cover rounded-lg shadow-md hover:scale-110 transition-transform"
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-rose-200">
          <p className="text-sm text-slate-400">Con amor, {data.personA} 💕</p>
        </div>
      </div>
    </div>
  );
}
