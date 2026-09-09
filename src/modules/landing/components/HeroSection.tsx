import { FloatingHearts } from '../FloatingHearts';

interface HeroSectionProps {
  onViewPlans: (e: React.MouseEvent) => void;
  onCreateGift: (e: React.MouseEvent) => void;
}

export function HeroSection({ onViewPlans, onCreateGift }: HeroSectionProps) {
  return (
    <section className="relative pt-12 pb-20 px-4 text-center overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
      <FloatingHearts variant="hero" />
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
      <div className="relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-8">
          Dedicatorias que <br />
          <span className="text-rose-500 animate-pulse-slow">Enamoran</span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
          Transforma tus momentos de amor creando una página web personalizada
          en segundos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onViewPlans}
            className="bg-rose-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-rose-600 transition-all transform hover:scale-105"
          >
            Ver Planes
          </button>
          <button
            onClick={onCreateGift}
            className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform hover:scale-105"
          >
            Crear Regalo
          </button>
        </div>
      </div>
    </section>
  );
}
