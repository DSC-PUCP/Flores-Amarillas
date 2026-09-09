import { FEATURES } from '../data/feature';

export function FeaturesSection() {
  // Duplicar features para scroll infinito
  const scrollingFeatures = [...FEATURES, ...FEATURES];

  return (
    <section className="py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            ¿Por qué elegir nuestras
            <span className="text-rose-500"> Dedicatorias</span>?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Descubre todas las funcionalidades que harán tu regalo único
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Track que se mueve */}
          <div
            className="flex animate-scroll gap-6"
            style={{ width: 'max-content' }}
          >
            {scrollingFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={`${index}-${feature.title}`}
                  className="flex-none w-[320px] text-center p-6 group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-300 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                      feature.highlight
                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border-2 border-rose-200 dark:border-rose-700'
                        : 'bg-slate-50 dark:bg-slate-700 text-rose-500 border border-slate-200 dark:border-slate-600 group-hover:bg-rose-50 dark:group-hover:bg-rose-900/40'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3
                    className={`font-semibold mb-2 transition-colors ${
                      feature.highlight
                        ? 'text-rose-700 dark:text-rose-400'
                        : 'text-slate-900 dark:text-slate-100 group-hover:text-rose-600'
                    }`}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={`text-sm transition-colors ${
                      feature.highlight
                        ? 'text-rose-600/80 dark:text-rose-300'
                        : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`}
                  >
                    {feature.description}
                  </p>

                  {feature.badge && (
                    <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">
                      ✨ {feature.badge}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Espacio al final para evitar corte abrupto */}
            <div className="flex-none w-6"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
