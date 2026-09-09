import { Book, Calendar, ChevronRight, Heart } from 'lucide-react';
import React, { useState } from 'react';
import type { TemplateSlideProps } from '../../types';

type HistoriaDeDosData = {
  personA: string;
  personB: string;
  message: string;
  startDate: string;
  themeId: string;
  image?: string;
  timelinePhotos: string[];
};

export function HistoriaDeDosTemplate({ templateData }: TemplateSlideProps) {
  const data = templateData as HistoriaDeDosData;
  const [currentChapter, setCurrentChapter] = useState(0);

  const chapters = [
    {
      title: 'Capítulo 1: El Comienzo',
      content: `Todo comenzó el ${new Date(data.startDate).toLocaleDateString(
        'es-ES',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )}...`,
      image: data.image,
    },
    {
      title: 'Capítulo 2: Nuestro Mensaje',
      content: data.message,
      image: data.timelinePhotos[0],
    },
    {
      title: 'Capítulo 3: Momentos Especiales',
      content: 'Cada foto cuenta una historia...',
      image: data.timelinePhotos[1] || data.timelinePhotos[0],
    },
  ];

  const currentChapterData = chapters[currentChapter];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Book-like Container */}
        <div className="bg-amber-50 rounded-2xl shadow-2xl overflow-hidden border-8 border-amber-900/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 text-white p-6 text-center">
            <Book className="w-12 h-12 mx-auto mb-3" />
            <h1 className="font-serif text-4xl mb-2">Historia de Dos</h1>
            <p className="text-purple-200 flex items-center justify-center gap-2">
              <span>{data.personA}</span>
              <Heart className="w-4 h-4 fill-current" />
              <span>{data.personB}</span>
            </p>
          </div>

          {/* Chapter Content */}
          <div className="p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center min-h-[400px]">
              {/* Left: Image */}
              <div className="relative">
                {currentChapterData.image ? (
                  <>
                    <div className="absolute inset-0 bg-purple-500/20 rounded-xl transform rotate-3"></div>
                    <img
                      src={currentChapterData.image}
                      alt={currentChapterData.title}
                      className="relative w-full h-80 object-cover rounded-xl shadow-xl"
                    />
                  </>
                ) : (
                  <div className="w-full h-80 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-24 h-24 text-purple-300" />
                  </div>
                )}
              </div>

              {/* Right: Text */}
              <div>
                <h2 className="font-serif text-3xl text-purple-900 mb-4">
                  {currentChapterData.title}
                </h2>
                <p className="font-serif text-lg text-slate-700 leading-relaxed italic mb-6">
                  "{currentChapterData.content}"
                </p>

                {/* Chapter Indicator */}
                <div className="flex gap-2 mb-6">
                  {chapters.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        idx === currentChapter
                          ? 'bg-purple-600'
                          : 'bg-purple-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  {currentChapter > 0 && (
                    <button
                      onClick={() => setCurrentChapter((prev) => prev - 1)}
                      className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      Anterior
                    </button>
                  )}
                  {currentChapter < chapters.length - 1 && (
                    <button
                      onClick={() => setCurrentChapter((prev) => prev + 1)}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      Siguiente <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline Photos at Bottom */}
            {currentChapter === chapters.length - 1 &&
              data.timelinePhotos.length > 0 && (
                <div className="mt-12 pt-8 border-t border-purple-200">
                  <h3 className="text-center font-serif text-2xl text-purple-900 mb-6">
                    Nuestra Galería
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {data.timelinePhotos.slice(0, 4).map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Momento ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Footer */}
          <div className="bg-purple-900/10 p-6 text-center">
            <p className="text-purple-800 font-serif italic">
              Escrito con amor por {data.personA} 💜
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
