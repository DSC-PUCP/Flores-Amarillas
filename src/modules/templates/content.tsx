import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Flower2,
  Heart,
  ImageOff,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import type { Template } from '@/core/models/template';
import { imagenes } from '@/lib/imagenes';
import { usePlans } from '../landing/hooks/usePlans';
import { ejemploDe, porDestacados } from './components/config/ejemplos';
import { PremiumThumbnail } from './components/templates/plantilla_giano_feat_leo/components/premium-thumbnail';
import { useTemplates } from './hooks/useTemplate';

/** Etiqueta del filtro sin filtrar. Es el valor por defecto de la pantalla. */
const TODOS = 'Todos';

function TemplateThumbnail({ template }: { template: Template }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const isFlowerDesign = template.templateKey === 'plantilla_gratuita';
  const image = isFlowerDesign
    ? imagenes.ramoGirasoles
    : template.previewImageUrl;
  const imageFailed = !image || failedImage === image;

  if (template.templateKey === 'plantilla_giano_feat_leo') {
    return <PremiumThumbnail />;
  }

  if (isFlowerDesign) {
    return (
      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-[#FFF8D7] px-6 pt-7">
        <span className="absolute left-5 top-5 rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-semibold text-[#183E32]">
          Sobre, carta y foto
        </span>
        <div className="relative mt-5 h-48 w-56 max-w-full">
          {imageFailed ? (
            <Flower2
              className="absolute inset-x-[24%] top-1 h-32 w-[52%] text-[#DFA900]"
              strokeWidth={1.2}
            />
          ) : (
            <img
              src={image}
              alt=""
              loading="lazy"
              onError={() => setFailedImage(image)}
              className="absolute inset-x-[8%] top-0 h-40 w-[84%] object-contain motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:-translate-y-2"
            />
          )}
          <span className="absolute inset-x-0 bottom-0 h-[100px] rounded-[5px_5px_12px_12px] bg-[#EEC541] shadow-[0_12px_24px_-15px_#183E3260]" />
          <span className="absolute inset-x-0 bottom-0 h-[100px] rounded-b-xl bg-[#FFECA2] [clip-path:polygon(0_0,50%_65%,100%_0,100%_100%,0_100%)]" />
          <span className="absolute inset-x-0 bottom-0 h-[100px] rounded-b-xl bg-[#FFE798] [clip-path:polygon(0_100%,50%_30%,100%_100%)]" />
          <span className="absolute bottom-7 left-1/2 grid size-10 -translate-x-1/2 place-items-center rounded-full bg-[#F17B62] text-[#FFF8D7] shadow-sm">
            <Heart size={17} fill="currentColor" />
          </span>
          <span className="absolute inset-x-3 bottom-2 truncate text-center font-display text-[11px] italic text-[#796423]">
            {template.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden bg-[#F2F2E8]">
      {imageFailed ? (
        <div className="flex flex-col items-center gap-3 px-8 text-center text-[#597157]">
          <ImageOff size={28} strokeWidth={1.3} />
          <p className="text-sm">
            La imagen de este diseño no está disponible.
          </p>
        </div>
      ) : (
        <img
          src={image}
          alt={`Vista de ${template.name}`}
          loading="lazy"
          onError={() => setFailedImage(image)}
          className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
        />
      )}
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <section aria-busy="true" aria-label="Cargando diseños">
      <p className="mb-5 text-sm text-[#597157]">
        Estamos preparando los diseños…
      </p>
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        aria-hidden="true"
      >
        {['first', 'second', 'third'].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-[26px] border border-[#183E32]/10 bg-white motion-safe:animate-pulse"
          >
            <div className="h-64 bg-[#F8F0CF]" />
            <div className="space-y-4 p-6">
              <div className="h-5 w-2/3 rounded bg-[#E9EDDF]" />
              <div className="h-3 w-full rounded bg-[#F1F2E9]" />
              <div className="h-3 w-4/5 rounded bg-[#F1F2E9]" />
              <div className="mt-7 h-12 rounded-full bg-[#F7E89E]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TemplateContent() {
  const {
    data: templates = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useTemplates();
  const { data: plans = [] } = usePlans();
  const navigate = useNavigate();
  /*
   * El plan elegido se lee de la URL, no de un estado local.
   *
   * Un `useState` no podia responder a un enlace que ya trae el filtro puesto,
   * que es lo que mandan las tarjetas del home.
   */
  const { plan: planEnLaUrl } = useSearch({ from: '/__layout/template/' });
  const selectedPlan = planEnLaUrl ?? TODOS;
  const setSelectedPlan = (name: string) =>
    navigate({
      to: '/template',
      // "Todos" es el estado por defecto: no ensucia la barra de direcciones.
      search: name === TODOS ? {} : { plan: name },
      replace: true,
    });
  /*
   * El precio de cada diseno sale de su plan. `usePlans` ya estaba cargado
   * aqui para los chips del filtro, asi que no cuesta ninguna consulta nueva.
   */
  const precioDe = (planId: number) =>
    plans.find((plan) => plan.id === planId)?.price;
  const visibleTemplates = templates.filter((template) => template.isVisible);
  /*
   * `sort` sobre una copia: `filter` ya devuelve un array nuevo, pero dejarlo
   * escrito evita que un dia se ordene el array de la query y React Query
   * reparta a otros el orden cambiado. El comparador solo sube los destacados;
   * `sort` es estable, asi que el resto conserva el orden de la base.
   */
  const filteredTemplates = visibleTemplates
    .filter(
      (template) => selectedPlan === TODOS || template.tipoPlan === selectedPlan
    )
    .sort(porDestacados);
  const planNames = [TODOS, ...new Set(plans.map((plan) => plan.name))].filter(
    (name, index, names) => names.indexOf(name) === index
  );

  return (
    <div className="min-h-svh bg-[#FFFCF4] px-5 py-8 text-[#183E32] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/home"
          className="mb-9 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#597157] hover:text-[#183E32] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
        >
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <header className="mb-10 max-w-3xl">
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.3rem)] leading-[1.06] tracking-tight">
            Elige cómo empieza <span className="italic">su sorpresa.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#597157] sm:text-lg">
            Encuentra el diseño que va con ustedes. Después, hazlo suyo con tus
            palabras y recuerdos.
          </p>
        </header>

        {isLoading ? (
          <CatalogSkeleton />
        ) : error ? (
          <section className="max-w-2xl rounded-[28px] border border-[#183E32]/10 bg-white px-6 py-10 sm:px-9">
            <Flower2 size={32} className="mb-5 text-[#BD921D]" />
            <h2 className="font-display text-3xl">
              Los diseños están tardando en llegar.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#597157]">
              No pudimos cargar el catálogo. Inténtalo de nuevo para ver las
              opciones disponibles.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#183E32] px-6 text-sm font-semibold text-white hover:bg-[#285642] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
              >
                <RefreshCw
                  size={15}
                  className={isFetching ? 'motion-safe:animate-spin' : ''}
                />
                {isFetching ? 'Volviendo a intentar…' : 'Volver a intentar'}
              </button>
              <Link
                to="/home"
                className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
              >
                Volver al inicio
              </Link>
            </div>
          </section>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-5 border-b border-[#183E32]/12 pb-6">
              <fieldset className="m-0 flex min-w-0 max-w-full flex-wrap gap-2 border-0 p-0">
                <legend className="sr-only">Filtrar diseños por plan</legend>
                {planNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedPlan(name)}
                    aria-pressed={selectedPlan === name}
                    className={`min-h-11 rounded-full px-5 py-2 text-sm font-semibold break-words motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32] ${
                      selectedPlan === name
                        ? 'bg-[#183E32] text-white'
                        : 'border border-[#183E32]/15 bg-white text-[#597157] hover:border-[#183E32]/40 hover:text-[#183E32]'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </fieldset>
              <output className="text-xs text-[#597157]">
                {filteredTemplates.length}{' '}
                {filteredTemplates.length === 1
                  ? 'diseño disponible'
                  : 'diseños disponibles'}
              </output>
            </div>

            {filteredTemplates.length === 0 ? (
              <section className="rounded-[28px] bg-[#FFF8D7] px-6 py-12 text-center">
                <Flower2 size={36} className="mx-auto mb-5 text-[#9B7916]" />
                <h2 className="font-display text-3xl">
                  {visibleTemplates.length === 0
                    ? 'Estamos preparando nuevas sorpresas.'
                    : 'Aún no hay diseños en este plan.'}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#597157]">
                  {visibleTemplates.length === 0
                    ? 'Vuelve un poco más tarde para descubrir los diseños disponibles.'
                    : 'Puedes explorar los demás planes para encontrar tu dedicatoria.'}
                </p>
                {visibleTemplates.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(TODOS)}
                    className="mt-6 min-h-12 rounded-full bg-[#183E32] px-6 text-sm font-semibold text-white hover:bg-[#285642] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
                  >
                    Ver todos los diseños
                  </button>
                ) : (
                  <Link
                    to="/home"
                    className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#183E32] px-6 text-sm font-semibold text-white hover:bg-[#285642] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
                  >
                    <ArrowLeft size={15} /> Volver al inicio
                  </Link>
                )}
              </section>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <article
                    key={template.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-[#183E32]/12 bg-white shadow-[0_9px_26px_-22px_#183E3255] motion-safe:transition-shadow hover:shadow-[0_16px_34px_-22px_#183E3260]"
                  >
                    <TemplateThumbnail template={template} />
                    <div className="flex flex-1 flex-col p-6">
                      {template.tipoPlan && (
                        <p className="mb-3 text-[10px] font-bold tracking-[0.12em] uppercase text-[#597157]">
                          {template.tipoPlan}
                        </p>
                      )}
                      <h2 className="font-display text-2xl leading-tight break-words">
                        {template.name}
                      </h2>
                      {template.description && (
                        <p className="mt-3 text-sm leading-relaxed break-words text-[#597157]">
                          {template.description}
                        </p>
                      )}
                      {/*
                        El precio, a la vista en la tarjeta.

                        Antes solo aparecia en la pagina del regalo, ya creado:
                        se elegia un diseno sin saber lo que costaba y el precio
                        salia al final, que es la peor forma de enterarse. Las
                        pasarelas tambien lo piden: un catalogo tiene que decir
                        cuanto vale cada cosa antes de comprarla.

                        Si el plan aun no ha cargado no se escribe nada: mejor
                        un hueco un instante que un "S/ 0.00" que no es cierto.
                      */}
                      {precioDe(template.planId) !== undefined && (
                        <p className="mt-4 font-display text-2xl text-[#183E32]">
                          {precioDe(template.planId) === 0 ? (
                            'Gratis'
                          ) : (
                            <>
                              S/ {precioDe(template.planId)?.toFixed(2)}{' '}
                              <span className="font-sans text-xs font-medium text-[#597157]">
                                pago único
                              </span>
                            </>
                          )}
                        </p>
                      )}
                      {/*
                        Ver el ejemplo es la accion principal, no un enlace
                        pequeno debajo. Quien llega no sabe que va a recibir su
                        persona querida, y hasta que no lo ve no tiene con que
                        decidir: ensenarselo de un clic es lo que vende. Abre la
                        pagina de ejemplo, ya activada, tal como la recibe esa
                        persona.

                        Personalizar sigue a la vista y a un clic, en
                        secundario. Si un diseno nuevo todavia no tiene ejemplo
                        (ver `ejemplos.ts`), personalizar vuelve a ser el boton
                        principal y la tarjeta no queda coja.
                      */}
                      <div className="mt-auto flex flex-col gap-3 pt-6">
                        {ejemploDe(template.templateKey) ? (
                          <>
                            <Link
                              to="/lovepage/$lovepageId"
                              params={{
                                lovepageId: ejemploDe(
                                  template.templateKey
                                ) as string,
                              }}
                              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FFD329] px-4 py-3 text-sm font-semibold text-[#183E32] hover:bg-[#F0C51C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
                            >
                              <Eye size={16} className="shrink-0" />
                              Ver el ejemplo completo
                            </Link>
                            <button
                              type="button"
                              onClick={() =>
                                navigate({ to: `/template/${template.id}` })
                              }
                              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#183E32]/20 px-4 py-3 text-sm font-semibold text-[#183E32] hover:border-[#183E32]/50 hover:bg-[#FFFCF4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
                            >
                              Personalizar este diseño{' '}
                              <ArrowRight size={16} className="shrink-0" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              navigate({ to: `/template/${template.id}` })
                            }
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FFD329] px-4 py-3 text-sm font-semibold text-[#183E32] hover:bg-[#F0C51C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
                          >
                            Personalizar este diseño{' '}
                            <ArrowRight size={16} className="shrink-0" />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
