import { Link } from '@tanstack/react-router';
import { usePlans } from '../hooks/usePlans';

export function PlansSection() {
  const { data: plans = [], isLoading, error } = usePlans();

  if (isLoading) {
    return (
      <section id="plans" className="relative py-20 px-4">
        <div className="text-center">
          <div>Cargando planes...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="plans" className="relative py-20 px-4">
        <div className="text-center">
          <div>Error al cargar los planes: {error.message}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="plans" className="relative py-20 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl text-slate-900 dark:text-slate-100 font-bold mb-4">
            Elige tu Plan
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Desde opciones gratuitas hasta experiencias premium
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,320px))] gap-8 justify-center">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="w-full max-w-sm h-96 flex flex-col rounded-xl p-6 border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
            >
              {/* Header del plan */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-rose-600 dark:text-rose-400">
                    S./ {plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-slate-500 dark:text-slate-400">
                      c/u
                    </span>
                  )}
                </div>
              </div>

              {/* Área para descripción y características - expandible */}
              <div className="flex-grow mb-6">
                <div className="space-y-3">
                  {/* Placeholder para descripción futura */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                    {plan.description}
                  </p>

                  {/* Espacio reservado para características futuras */}
                  <div className="space-y-2 pt-4">
                    {
                      plan.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-slate-600 dark:text-slate-300"
                        >
                          <span className="w-2 h-2 bg-rose-400 rounded-full mr-3"></span>
                          {feature}
                        </div>
                      ))
                    }

                  </div>
                </div>
              </div>

              {/* Botón fijo en la parte inferior */}
              <div className="mt-auto">
                <Link to="/template" className="block w-full">
                  <button className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg">
                    Seleccionar Plan
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
