import { Heart, Sparkles } from 'lucide-react';
import React from 'react';
import type { TemplateSlideProps } from '../../types';

type JuntosPorSiempreData = {
  personA: string;
  personB: string;
  message: string;
  startDate: string;
  themeId: string;
  image?: string;
  timelinePhotos?: string[];
};

export function JuntosPorSiempreTemplate({ templateData }: TemplateSlideProps) {
  const data = templateData as JuntosPorSiempreData;
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with Image */}
          <div className="relative h-80 bg-gradient-to-br from-orange-400 to-pink-400">
            {data.image ? (
              <img
                src={data.image}
                alt="Nosotros"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-32 h-32 text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {/* Names Overlay */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <h1 className="font-script text-6xl text-white mb-2">
                {data.personA} & {data.personB}
              </h1>
              <div className="flex items-center justify-center gap-2 text-white/90">
                <Sparkles className="w-5 h-5" />
                <span className="text-xl">Juntos por Siempre</span>
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-12">
            {/* Message */}
            <div className="mb-8 text-center">
              <p className="font-serif text-2xl text-slate-700 leading-relaxed italic">
                "{data.message}"
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 my-8">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-orange-300"></div>
              <Heart className="w-6 h-6 text-orange-400 fill-orange-400" />
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-orange-300"></div>
            </div>

            {/* Timeline Photos Grid */}
            {data.timelinePhotos && data.timelinePhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {data.timelinePhotos.slice(0, 6).map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={photo}
                      alt={`Recuerdo ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="text-center">
              <p className="text-slate-500 text-sm mb-2">
                Desde el{' '}
                {new Date(data.startDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="font-script text-xl text-orange-500">
                Con todo mi corazón, {data.personA}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
