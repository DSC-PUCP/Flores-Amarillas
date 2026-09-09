import { Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface RoadmapStep {
  title: string;
  desc: string;
  image: string;
  align: 'left' | 'right';
}

const ROADMAP_STEPS: RoadmapStep[] = [
  {
    title: '1. Elige tu Plan',
    desc: 'Comienza seleccionando el plan perfecto para ti. Desde una sorpresa rápida y gratuita hasta una experiencia premium inolvidable de un año.',
    image:
      'https://kxsoembxjnuvxddqmkes.supabase.co/storage/v1/object/public/Valentines/assets/03730227-d5cf-4c2d-b700-556ebd3964a7.jpg',
    align: 'left',
  },
  {
    title: '2. Selecciona Diseño',
    desc: "Navega por nuestra galería de plantillas románticas. Tenemos el estilo que define su relación.",
    image:
      'https://kxsoembxjnuvxddqmkes.supabase.co/storage/v1/object/public/Valentines/assets/60ead124-4b17-4e81-882d-f65c57d97588.jpg',
    align: 'right',
  },
  {
    title: '3. Personaliza',
    desc: "Sube sus mejores fotos, escribe esa carta que sale del corazón, define la fecha de inicio.",
    image:
      'https://kxsoembxjnuvxddqmkes.supabase.co/storage/v1/object/public/Valentines/assets/4f6d3bad-a8cb-4093-8f2a-61a5200d9f0a.jpg',
    align: 'left',
  },
  {
    title: '4. Comparte',
    desc: 'Generamos un enlace único al instante. Envíalo por WhatsApp, Instagram o QR y sorprende a tu persona favorita.',
    image:
      'https://kxsoembxjnuvxddqmkes.supabase.co/storage/v1/object/public/Valentines/assets/bac03ec0-38f6-4d23-840d-ec629eba0594.jpg',
    align: 'right',
  },
];

export function RoadmapSection() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Intersection Observer para animaciones scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setVisibleSteps((prev) =>
              prev.includes(index) ? prev : [...prev, index]
            );
          }
        });
      },
      { threshold: 0.3 }
    );

    stepsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      className="py-24 px-4 relative overflow-hidden bg-transparent"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Título */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-slate-100">
            ¿Cómo crear tu
            <span className="text-rose-500"> Regalo</span>?
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Sigue este camino para construir el detalle perfecto que sorprenderá
            a tu pareja
          </p>
        </div>

        <div className="relative">
          {/* Línea central (Desktop) - Línea izquierda (Mobile) */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 md:-ml-0.5 bg-gradient-to-b from-rose-300 via-pink-500 to-rose-300 rounded-full opacity-30"></div>

          <div className="space-y-12 md:space-y-24">
            {ROADMAP_STEPS.map((step, index) => {
              const isEven = index % 2 === 0;
              const isVisible = visibleSteps.includes(index);

              return (
                <div
                  key={index}
                  ref={(el) => {
                    stepsRef.current[index] = el;
                  }}
                  data-index={index}
                  className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 transition-all duration-1000 ease-out ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-24'
                  }`}
                >
                  {/* Nodo en la línea */}
                  <div
                    className={`absolute left-8 md:left-1/2 w-8 h-8 -ml-4 rounded-full border-4 border-white z-20 flex items-center justify-center transition-all duration-500 delay-500 ${
                      isVisible
                        ? 'bg-rose-500 scale-110 shadow-[0_0_20px_rgba(225,29,72,0.6)]'
                        : 'bg-slate-300'
                    }`}
                  >
                    <Heart
                      className={`w-3 h-3 text-white ${isVisible ? 'fill-current' : ''}`}
                    />
                  </div>

                  {/* Contenido (Texto) */}
                  <div
                    className={`w-full md:w-1/2 pl-20 md:pl-0 flex ${isEven ? 'md:justify-end md:pr-16' : 'md:justify-start md:pl-16 md:order-2'}`}
                  >
                    <div
                      className={`relative group ${isEven ? 'text-left md:text-right' : 'text-left'}`}
                    >
                      {/* Imagen móvil */}
                      <div className="md:hidden mb-6 rounded-2xl overflow-hidden shadow-lg border border-slate-200 aspect-video">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Imagen (Desktop solamente) */}
                  <div
                    className={`hidden md:block w-1/2 ${isEven ? 'pl-16 order-2' : 'pr-16 text-right order-1'}`}
                  >
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-rose-900/10 border border-slate-200 group transform transition-transform hover:-translate-y-2 duration-500">
                      <div className="absolute inset-0 bg-rose-500/10 group-hover:bg-transparent transition-colors z-10"></div>
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
