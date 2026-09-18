import { useNavigate, useParams, useRouter } from '@tanstack/react-router';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Gift,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import type { FileUploadRef } from '@/core/models';
import type { TemplateData, TemplateField } from '@/core/models/template';
import { cn } from '@/lib/utils';
import { SongPicker } from '@/modules/music/components/SongPicker';
import { registrarCompraPorWhatsapp } from '@/modules/payments/whatsapp';
import { usePlanById } from '@/modules/plan/hooks/usePlan';
import { MascotPicker } from '@/modules/templates/components/templates/plantilla_giano_feat_leo/components/mascot-picker';
import { readGiftMascot } from '@/modules/templates/components/templates/plantilla_giano_feat_leo/mascots';
import { useTemplateById } from '../hooks/useTemplate';
import { GuardaTuEnlace } from './components/GuardaTuEnlace';
import { EditorPreview } from './editor-preview';
import {
  type EditorScene,
  fieldScene,
  formDefaults,
  stepScene,
} from './editor-preview-protocol';
import {
  useCreateLovepage,
  useCreateLovepageConPromo,
} from './hooks/useLovePage';
import { ImageUploadField } from './image-upload-field';
import { useEditorData } from './use-editor-data';

const EMPTY_STEPS: import('@/core/models/template').TemplateForm = [];

export function TemplateForm() {
  const navigate = useNavigate();
  const router = useRouter();
  const params = useParams({ strict: false });
  const id = Number(params.id);

  /*
   * La direccion del regalo, absoluta: se va a pegar en un chat, y ahi una
   * ruta relativa no lleva a ningun sitio.
   *
   * La ruta la arma el router en vez de escribirla a mano, para que siga el
   * mismo camino que los enlaces de la app si algun dia cambia. Se resuelve
   * contra `document.baseURI`, que es lo que usa el navegador para lo mismo.
   */
  const enlaceDelRegalo = (pageId: string) =>
    new URL(
      router.buildLocation({
        to: '/lovepage/$lovepageId',
        params: { lovepageId: pageId },
      }).href,
      document.baseURI
    ).href;

  const { data: template, isLoading, error } = useTemplateById(id);
  const { data: plan } = usePlanById(template?.planId ?? 0);
  const createLovepageMutation = useCreateLovepage();
  const createConPromoMutation = useCreateLovepageConPromo();

  const [promoCode, setPromoCode] = useState('');
  const [promoAviso, setPromoAviso] = useState<string | null>(null);
  /*
   * La pagina ya creada, esperando a que se guarde el enlace.
   *
   * Es un paso entre generar y ver el regalo: se ensena la direccion, se
   * copia, y solo entonces se va al regalo. Ver `GuardaTuEnlace`.
   *
   * No entra aqui el codigo con precio: ese abre el Yape, que ya da el enlace
   * con el aviso de pago y lo repetiria dos veces.
   */
  const [paginaParaCompartir, setPaginaParaCompartir] = useState<string | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<FileUploadRef[]>([]);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [scene, setScene] = useState<EditorScene | null>(null);
  const [revision, setRevision] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const steps = template?.schemaJson ?? EMPTY_STEPS;
  const previewData = useEditorData(formValues, steps);
  /*
   * Los dos botones de la tarjeta final se bloquean juntos: son dos caminos
   * al mismo regalo y pulsar el segundo mientras el primero sube las fotos
   * crearia dos paginas, una de ellas gastando un cupo de la promocion.
   */
  const generando =
    createLovepageMutation.isPending || createConPromoMutation.isPending;
  /*
   * En la plantilla gratuita no se pregunta por el codigo: esa ya se ve
   * completa sin pagar, asi que un codigo ahi no daria nada y gastaria un cupo
   * de la promocion.
   *
   * Mientras el plan no ha cargado se da por gratuita —el campo aparece cuando
   * se sabe que hay algo que cobrar, y no al reves: es mejor que tarde un
   * instante en salir a que parpadee en la plantilla donde no va.
   */
  const promoDisponible = (plan?.price ?? 0) > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#b7801a]" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-slate-200">
          <p className="text-red-500 font-medium mb-2">
            Error al cargar la plantilla
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleFileUpload = (
    fieldName: string,
    uploadedFiles: File[],
    multiple: boolean
  ) => {
    setFiles((prev) => {
      const filtered = prev.filter((item) => item.key !== fieldName);
      if (!uploadedFiles.length) return filtered;
      const ref: FileUploadRef = {
        key: fieldName,
        file: multiple ? uploadedFiles : uploadedFiles[0],
      };
      return [...filtered, ref];
    });
  };

  const handleChange = (name: string, value: unknown) => {
    setScene(fieldScene(name));
    setReviewing(false);
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateCurrentStep = (step = currentStepData) => {
    const missingFields = step.fields.filter((field) => {
      if (!field.required) return false;
      const val =
        formValues[field.name] ??
        ('default' in field ? field.default : undefined);
      if (
        val === undefined ||
        val === null ||
        (typeof val === 'string' && !val.trim())
      )
        return true;
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    });

    if (missingFields.length > 0) {
      toast.error(
        `Por favor completa: ${missingFields.map((f) => f.label).join(', ')}`
      );
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setScene(null);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setScene(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateAllSteps = () => {
    const missingStep = steps.findIndex((step) => !validateCurrentStep(step));
    if (missingStep < 0) return true;
    editStep(missingStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  };

  const handleSubmit = async () => {
    if (!validateAllSteps()) return;

    const defaults = formDefaults(steps);
    createLovepageMutation.mutate(
      {
        templateId: id,
        configJson: { ...defaults, ...formValues } as TemplateData,
        files: files,
      },
      {
        onSuccess: (data) => {
          if (!data) {
            toast.error('Error: No se recibió ID de la dedicatoria');
            return;
          }
          toast.success('¡Dedicatoria creada con éxito!');
          // Antes de llevar al regalo, la direccion: es lo unico que hace que
          // llegue a alguien, y al ver el regalo ya nadie la lee.
          setPaginaParaCompartir(data);
        },
        onError: (err) => {
          toast.error(err.message || 'Error al crear la dedicatoria');
        },
      }
    );
  };

  /*
   * Mismo regalo y mismo formulario; lo que cambia es el final. Hay codigos
   * que regalan la pagina —queda activa y se va derecho a ella— y codigos que
   * la dejan a precio fijo, y entonces se abre el Yape de siempre con el monto
   * de la promocion en vez del precio del plan.
   *
   * Que sirva o no lo decide la base. Aqui solo se traduce a palabras.
   */
  const handlePromoSubmit = async () => {
    if (!validateAllSteps()) return;
    setPromoAviso(null);

    createConPromoMutation.mutate(
      {
        templateId: id,
        configJson: { ...formDefaults(steps), ...formValues } as TemplateData,
        files: files,
        codigo: promoCode,
      },
      {
        onSuccess: (canje) => {
          switch (canje.estado) {
            case 'agotado':
              setPromoAviso(
                'Se agotaron los cupos de este código. Tu regalo sigue aquí: puedes generarlo con el botón de arriba y pagarlo como siempre.'
              );
              return;
            case 'inexistente':
              setPromoAviso(
                'Ese código no existe. Revisa que esté escrito tal cual te lo pasaron.'
              );
              return;
            case 'pagar':
              /*
               * La pagina ya existe y el cupo ya es suyo; lo que falta es el
               * pago. Un codigo con precio ya es un trato hablado, asi que en
               * vez del formulario de Yape —monto, captura, revision— se manda
               * al chat con el mensaje escrito, y el pago queda anotado como
               * pendiente antes de salir.
               *
               * El enlace se arma aqui y no en el chat: se pega en el mensaje y
               * se guarda en `pagos`, y desde el editor la direccion del
               * navegador es esta pantalla, no la del regalo.
               */
              void (async () => {
                const enlace = enlaceDelRegalo(canje.pageId);
                try {
                  const chat = await registrarCompraPorWhatsapp({
                    pageId: canje.pageId,
                    enlace,
                    codigo: promoCode.trim(),
                  });
                  if (!chat) {
                    setPromoAviso(
                      `Tu regalo ya está guardado en ${enlace}. Escríbenos por WhatsApp con ese enlace y tu código para activarlo.`
                    );
                    return;
                  }
                  // `assign` y no `open`: en el movil un `window.open` tras un
                  // `await` llega fuera del gesto y el navegador lo bloquea
                  // como ventana emergente.
                  window.location.assign(chat);
                } catch (error) {
                  setPromoAviso(
                    error instanceof Error
                      ? error.message
                      : 'No se pudo registrar tu compra'
                  );
                }
              })();
              return;
            default:
              toast.success('¡Código aplicado! Tu regalo ya está listo.');
              // Igual que el boton de siempre: el codigo gratis tampoco pasa
              // por el Yape, asi que el enlace no se lo dice nadie mas.
              setPaginaParaCompartir(canje.pageId);
          }
        },
        onError: (err) => {
          toast.error(err.message || 'No se pudo canjear tu código');
        },
      }
    );
  };

  const review = () => {
    if (!validateAllSteps()) return;
    setReviewing(true);
    setScene('review');
    setRevision((value) => value + 1);
    setMobileTab('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const editStep = (index: number) => {
    setReviewing(false);
    setCurrentStep(index);
    setScene(null);
    setRevision((value) => value + 1);
    setMobileTab('edit');
  };

  return (
    <div className="min-h-screen bg-[#FFFCF4] px-4 py-8 text-[#183E32] sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="space-y-3">
          <button
            type="button"
            onClick={() => navigate({ to: '/template' })}
            className="inline-flex min-h-11 items-center gap-2 text-sm text-[#597157]"
          >
            <ChevronLeft size={16} /> Ver otros diseños
          </button>
          <h1 className="font-display text-3xl sm:text-4xl">
            Haz suyo este regalo.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[#597157]">
            {template.name} · Escribe, elige tus recuerdos y mira cómo quedan.
          </p>
          <p className="text-xs text-[#597157]">
            Completa las secciones en el orden del regalo. Los campos con * son
            obligatorios.
          </p>
        </header>
        <nav aria-label="Secciones de tu regalo">
          <ol className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <li key={step.title}>
                <button
                  type="button"
                  onClick={() => editStep(index)}
                  aria-current={
                    !reviewing && currentStep === index ? 'step' : undefined
                  }
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2',
                    !reviewing && currentStep === index
                      ? 'border-[#183E32] bg-[#183E32] text-white'
                      : 'border-[#183E32]/15 bg-white text-[#597157] hover:bg-[#FFF8D7]'
                  )}
                >
                  <span className="tabular-nums opacity-70">{index + 1}</span>
                  {step.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        {reviewing && (
          <section
            aria-label="Revisión final del regalo"
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#183E32]/15 bg-[#FFF8D7] p-5"
          >
            <div>
              <h2 className="font-display text-2xl">
                Recorre tu regalo completo.
              </h2>
              <p className="mt-1 text-sm text-[#597157]">
                Ábrelo como lo verá esa persona y revisa cada detalle antes de
                crearlo.
              </p>
            </div>
            {/* Generar vive abajo, junto a los ajustes: aquí competía con
                "Seguir editando" y se pulsaba sin haber revisado nada. */}
            <Button variant="outline" onClick={() => editStep(currentStep)}>
              Seguir editando
            </Button>
          </section>
        )}
        {/* En la revisión no hay nada que "editar": el móvil muestra los dos
            paneles seguidos para que generar quede siempre a la vista. */}
        <div
          role="tablist"
          aria-label="Editor del regalo"
          className={cn(
            'grid grid-cols-2 gap-2 rounded-2xl bg-[#183E32]/5 p-1.5 lg:hidden',
            reviewing && 'hidden'
          )}
        >
          {(['edit', 'preview'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`editor-tab-${tab}`}
              aria-controls={`editor-panel-${tab}`}
              aria-selected={mobileTab === tab}
              tabIndex={mobileTab === tab ? 0 : -1}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  const next = tab === 'edit' ? 'preview' : 'edit';
                  setMobileTab(next);
                  document.getElementById(`editor-tab-${next}`)?.focus();
                }
              }}
              onClick={() => setMobileTab(tab)}
              className={cn(
                'flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2',
                mobileTab === tab ? 'bg-white shadow-sm' : 'text-[#597157]'
              )}
            >
              {tab === 'edit' ? <Pencil size={16} /> : <Eye size={16} />}
              {tab === 'edit' ? 'Editar' : 'Vista previa'}
            </button>
          ))}
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <section
            id="editor-panel-edit"
            aria-label="Personalizar tu regalo"
            className={cn(
              'min-w-0 space-y-6',
              !reviewing && mobileTab !== 'edit' && 'hidden lg:block'
            )}
          >
            {reviewing ? (
              <>
                <div className="rounded-2xl border border-[#183E32]/15 bg-white p-6">
                  <h2 className="font-display text-2xl">
                    ¿Quieres ajustar algo?
                  </h2>
                  <div className="mt-4 grid gap-2">
                    {steps.map((step, index) => (
                      <button
                        key={step.title}
                        type="button"
                        onClick={() => editStep(index)}
                        className="flex min-h-12 items-center justify-between rounded-xl border border-[#183E32]/10 px-4 text-left text-sm hover:bg-[#FFF8D7]"
                      >
                        Editar {step.title}
                        <Pencil size={14} />
                      </button>
                    ))}
                  </div>
                </div>
                {/* El final del recorrido: después de repasar los ajustes, lo
                    único que queda por hacer. Por eso lleva borde entero y
                    sombra sólida, y no el gris del resto de tarjetas. */}
                <div className="rounded-2xl border-2 border-[#183E32] bg-[#FFF8D7] p-6 shadow-[0_6px_0_#183E32]">
                  <h2 className="font-display text-2xl">¿Todo listo?</h2>
                  <p className="mt-1 text-sm text-[#597157]">
                    Guardamos tu regalo y te damos el enlace para compartirlo.
                  </p>
                  <Button
                    onClick={handleSubmit}
                    disabled={generando}
                    className="mt-5 h-14 w-full rounded-xl bg-[#183E32] text-base font-semibold text-white shadow-md transition-transform hover:bg-[#285642] active:scale-[0.98] disabled:opacity-70"
                  >
                    {createLovepageMutation.isPending ? (
                      <Loader2 size={18} className="mr-2 animate-spin" />
                    ) : (
                      <Check size={18} className="mr-2" />
                    )}{' '}
                    Generar mi regalo
                  </Button>
                  {/* La promocion por codigo: la misma tarjeta, separada por
                      una linea. Va debajo del boton de siempre y no arriba a
                      proposito —quien no tiene codigo no deberia tener que
                      pasar por encima de un campo que no le toca— y no es otra
                      tarjeta porque entonces parecería otro paso del
                      formulario.

                      No sale en la plantilla gratuita: ahi no hay nada que
                      descontar y el codigo solo gastaria un cupo. */}
                  {promoDisponible && (
                    <div className="mt-6 border-t border-[#183E32]/20 pt-5">
                      <h3 className="font-display text-xl">
                        ¿Tienes un código?
                      </h3>
                      <p className="mt-1 text-sm text-[#597157]">
                        Ingrésalo acá: según el código, tu regalo sale gratis o
                        a un precio especial.
                      </p>
                      <Label htmlFor="promo-codigo" className="sr-only">
                        Código de promoción
                      </Label>
                      <Input
                        id="promo-codigo"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          // El aviso habla del codigo anterior. En cuanto se
                          // toca una letra deja de ser verdad.
                          setPromoAviso(null);
                        }}
                        placeholder="Escribe tu código"
                        autoComplete="off"
                        spellCheck={false}
                        /*
                         * `dark:bg-white` no es un descuido: la tarjeta que lo
                         * contiene tiene el crema escrito a mano, asi que el
                         * campo se queda claro tambien en modo oscuro. Sin esa
                         * variante gana el `dark:bg-input/30` que trae Input y
                         * el campo sale negro translucido sobre el crema.
                         */
                        className="mt-4 h-12 rounded-xl border-[#183E32]/20 bg-white text-base text-[#183E32] placeholder:text-[#597157]/60 focus-visible:border-[#b7801a] focus-visible:ring-[#b7801a]/30 dark:bg-white"
                      />
                      <Button
                        onClick={handlePromoSubmit}
                        disabled={generando || !promoCode.trim()}
                        className="mt-3 h-14 w-full rounded-xl bg-[#FFC800] text-base font-semibold text-[#183E32] shadow-[0_4px_0_#B07C0C] transition-all hover:bg-[#FFD633] active:translate-y-[3px] active:shadow-none disabled:opacity-60 disabled:shadow-[0_4px_0_#B07C0C]"
                      >
                        {createConPromoMutation.isPending ? (
                          <Loader2 size={18} className="mr-2 animate-spin" />
                        ) : (
                          <Gift size={18} className="mr-2" />
                        )}{' '}
                        Generar mi regalo con código
                      </Button>
                      {/* El aviso vive aquí y no en un toast: si los cupos se
                        acabaron hay que explicar que el regalo no se perdió y
                        que queda el camino de siempre, y eso no se lee en dos
                        segundos. */}
                      {promoAviso && (
                        <p
                          role="alert"
                          className="mt-3 rounded-xl border border-[#B07C0C] bg-white/70 px-4 py-3 text-sm leading-relaxed font-medium text-[#8A5A00]"
                        >
                          {promoAviso}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <span>
                      Sección {currentStep + 1} de {steps.length}
                    </span>
                    <span>{Math.round(progress)}% del recorrido</span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2 bg-slate-200 [&_[data-slot=progress-indicator]]:bg-amber-600"
                  />
                </div>

                {/* Current Step Card */}
                <Card className="border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white text-slate-900">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-xl pb-6">
                    <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#b7801a]/10 text-[#b7801a] text-sm font-bold">
                        {currentStep + 1}
                      </span>
                      {currentStepData.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      {currentStepData.description ??
                        'Completa la información para continuar.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-8 space-y-8 bg-white">
                    {currentStepData.fields.map((field) => (
                      <div
                        key={field.name}
                        onFocusCapture={() => {
                          setScene(fieldScene(field.name));
                          setRevision((value) => value + 1);
                        }}
                      >
                        <FieldRenderer
                          field={field}
                          /*
                           * El `default` del campo se ve escrito en el input,
                           * no solo en la vista previa. Es un respaldo y no un
                           * valor inicial en el estado: en cuanto alguien
                           * escribe —o borra— manda `formValues`, asi que
                           * vaciar un campo lo deja vacio y la validacion lo
                           * reclama como siempre.
                           *
                           * Las fotos quedan fuera: ahi `default` seria una
                           * URL y el subidor espera un archivo.
                           */
                          value={
                            field.type === 'image' || field.type === 'array'
                              ? formValues[field.name]
                              : (formValues[field.name] ??
                                ('default' in field
                                  ? field.default
                                  : undefined))
                          }
                          onChange={(val: unknown) =>
                            handleChange(field.name, val)
                          }
                          onFileUpload={(files: File[]) => {
                            // Update form value for preview/state logic
                            if (field.type === 'array')
                              handleChange(field.name, files);
                            else handleChange(field.name, files[0]);

                            // Update files state for submission
                            handleFileUpload(
                              field.name,
                              files,
                              field.type === 'array'
                            );
                          }}
                        />
                      </div>
                    ))}
                  </CardContent>

                  <CardFooter className="flex flex-wrap justify-between gap-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl py-6">
                    <Button
                      variant="ghost"
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                      className="text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Anterior
                    </Button>

                    {isLastStep ? (
                      <Button
                        onClick={review}
                        disabled={createLovepageMutation.isPending}
                        className="bg-[#b7801a] hover:bg-[#8f611b] text-white min-w-[140px] shadow-lg shadow-[#b7801a]/20"
                      >
                        {createLovepageMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Revisar regalo completo
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        className="bg-slate-900 hover:bg-slate-800 text-white min-w-[140px] shadow-md"
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </>
            )}
          </section>
          <section
            id="editor-panel-preview"
            aria-label="Vista previa del regalo"
            className={cn(
              'min-w-0 lg:sticky lg:top-6',
              !reviewing && mobileTab !== 'preview' && 'hidden lg:block'
            )}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold">
                <span className="size-2 rounded-full bg-[#597157]" />{' '}
                {reviewing ? 'El regalo completo' : 'Vista previa en vivo'}
              </h2>
              {!reviewing && (
                <button
                  type="button"
                  onClick={review}
                  className="min-h-11 text-xs font-semibold underline underline-offset-4"
                >
                  Revisar regalo completo
                </button>
              )}
            </div>
            <EditorPreview
              templateKey={template.templateKey}
              data={previewData}
              scene={
                reviewing ? 'review' : (scene ?? stepScene(currentStepData))
              }
              revision={revision}
            />
            <p className="mt-3 text-xs leading-relaxed text-[#597157]">
              {reviewing
                ? 'Tus textos y fotos, tal como los recibirá esa persona.'
                : 'Los cambios se muestran aquí. Tu regalo se guarda cuando pulses “Generar mi regalo”.'}
            </p>
          </section>
        </div>
      </div>
      {/*
        Aqui estaba el Yape de los codigos con descuento —monto, captura y
        revision a mano—. Ya no: un codigo con precio es un trato hablado y
        ahora el boton manda al chat con el mensaje escrito, dejando el pago
        anotado como pendiente. Ver el caso 'pagar' de `handlePromoSubmit`.

        `YapeDialog` sigue vivo para el cobro normal de la pagina del regalo.
      */}

      {/*
        El paso del enlace, para los dos caminos que no pasan por el Yape: el
        boton verde de siempre y el codigo que regala la pagina. El codigo con
        precio no lo necesita —el Yape ya da el enlace con el aviso de pago—.
      */}
      <GuardaTuEnlace
        open={paginaParaCompartir !== null}
        enlace={paginaParaCompartir ? enlaceDelRegalo(paginaParaCompartir) : ''}
        onContinuar={() => {
          if (!paginaParaCompartir) return;
          const pageId = paginaParaCompartir;
          setPaginaParaCompartir(null);
          navigate({ to: `/lovepage/${pageId}` });
        }}
      />
    </div>
  );
}

// --- Helper Component for Field Rendering ---

type FieldRendererProps = {
  field: TemplateField;
  value: unknown;
  onChange: (value: unknown) => void;
  onFileUpload: (files: File[]) => void;
};

function FieldRenderer({
  field,
  value,
  onChange,
  onFileUpload,
}: FieldRendererProps) {
  const textValue = typeof value === 'string' ? value : '';

  if (field.type === 'choice') {
    const selected =
      textValue || field.default || field.options[0]?.value || '';
    if (field.appearance === 'mascot') {
      return (
        <MascotPicker
          label={field.label}
          value={readGiftMascot(selected)}
          onChange={onChange}
        />
      );
    }
    return (
      <fieldset className="space-y-3">
        <legend className="text-base font-medium text-slate-700">
          {field.label}
        </legend>
        {field.options.map((option) => (
          <label key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              name={field.name}
              value={option.value}
              checked={selected === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    );
  }

  // Date Fields
  if (field.type === 'date') {
    return (
      <div className="space-y-3">
        <Label
          htmlFor={field.name}
          className="text-base font-medium text-slate-700"
        >
          {field.label}{' '}
          {field.required && <span className="text-[#b7801a]">*</span>}
        </Label>
        <Input
          type="date"
          id={field.name}
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 bg-slate-50/50 focus:bg-white text-slate-900 transition-all border-slate-200 focus:border-[#b7801a] focus:ring-[#b7801a]/20"
        />
      </div>
    );
  }

  // String Fields
  if (field.type === 'string') {
    const isLongText = field.max_length && field.max_length > 100;
    // Check for "date" format or fallback to text
    const inputType =
      field.format === 'date'
        ? 'date'
        : field.format === 'email'
          ? 'email'
          : field.format === 'url'
            ? 'url'
            : 'text';

    return (
      <div className="space-y-3">
        <Label
          htmlFor={field.name}
          className="text-base font-medium text-slate-700"
        >
          {field.label}{' '}
          {field.required && <span className="text-[#b7801a]">*</span>}
        </Label>
        {isLongText ? (
          <Textarea
            id={field.name}
            placeholder="Escribe aquí..."
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            maxLength={field.max_length}
            className="min-h-[120px] resize-y bg-slate-50/50 focus:bg-white text-slate-900 transition-all border-slate-200 focus:border-[#b7801a] focus:ring-[#b7801a]/20"
          />
        ) : (
          <Input
            id={field.name}
            type={inputType}
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            maxLength={field.max_length}
            className="h-11 bg-slate-50/50 focus:bg-white text-slate-900 transition-all border-slate-200 focus:border-[#b7801a] focus:ring-[#b7801a]/20"
          />
        )}
        {field.max_length && (
          <div className="text-right text-xs text-slate-400 font-medium">
            {textValue.length} / {field.max_length}
          </div>
        )}
      </div>
    );
  }

  // Number Fields
  if (field.type === 'number') {
    return (
      <div className="space-y-3">
        <Label
          htmlFor={field.name}
          className="text-base font-medium text-slate-700"
        >
          {field.label}{' '}
          {field.required && <span className="text-[#b7801a]">*</span>}
        </Label>
        <Input
          type="number"
          id={field.name}
          value={textValue}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          className="h-11 bg-slate-50/50 focus:bg-white text-slate-900 transition-all border-slate-200 focus:border-[#b7801a] focus:ring-[#b7801a]/20"
        />
      </div>
    );
  }

  // Boolean Fields
  if (field.type === 'boolean') {
    return (
      <div className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 hover:border-[#b7801a]/50 hover:bg-[#b7801a]/5 transition-all cursor-pointer bg-white">
        <Checkbox
          id={field.name}
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked)}
          className="data-[state=checked]:bg-[#b7801a] border-slate-300 w-5 h-5"
        />
        <Label
          htmlFor={field.name}
          className="text-base font-medium text-slate-700 cursor-pointer flex-1"
        >
          {field.label}
        </Label>
      </div>
    );
  }

  // Array Fields (non-image)
  if (field.type === 'array' && field.item_type !== 'image') {
    const items = Array.isArray(value)
      ? value.filter(
          (item): item is string | number | boolean =>
            typeof item === 'string' ||
            typeof item === 'number' ||
            typeof item === 'boolean'
        )
      : [];
    const canAddMore = !field.max_items || items.length < field.max_items;
    const needsMore = field.min_items && items.length < field.min_items;
    // La etiqueta del campo puede ser una frase larga: el botón y cada casilla
    // usan el nombre corto del elemento.
    const itemName = field.item_label
      ? field.item_label.charAt(0).toUpperCase() + field.item_label.slice(1)
      : 'Elemento';

    const addItem = () => {
      const newItem =
        field.item_type === 'boolean'
          ? false
          : field.item_type === 'number'
            ? 0
            : '';
      onChange([...items, newItem]);
    };

    const removeItem = (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, newValue: string | number | boolean) => {
      const updated = [...items];
      updated[index] = newValue;
      onChange(updated);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium text-slate-700">
            {field.label}{' '}
            {field.required && <span className="text-[#b7801a]">*</span>}
          </Label>
          <span className="shrink-0 whitespace-nowrap text-xs text-slate-400 font-medium">
            {items.length}
            {field.max_items ? ` / ${field.max_items}` : ''}
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: inputs controlados de un esquema que almacena valores sin identificadores
              key={idx}
              className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 bg-white group hover:border-slate-300 transition-colors"
            >
              <div className="flex-1">
                {field.item_type === 'string' && (
                  <div className="space-y-1">
                    <Input
                      type="text"
                      value={typeof item === 'boolean' ? '' : item}
                      onChange={(e) => updateItem(idx, e.target.value)}
                      placeholder={`${itemName} ${idx + 1}`}
                      maxLength={field.item_max_length}
                      className="h-10 bg-slate-50/50 focus:bg-white text-slate-900 border-slate-200 focus:border-[#b7801a] focus:ring-[#b7801a]/20"
                    />
                    {field.item_max_length && (
                      <div className="text-right text-[10px] text-slate-400 font-medium">
                        {typeof item === 'string' ? item.length : 0} /{' '}
                        {field.item_max_length}
                      </div>
                    )}
                  </div>
                )}
                {field.item_type === 'number' && (
                  <Input
                    type="number"
                    value={typeof item === 'boolean' ? '' : item}
                    onChange={(e) => updateItem(idx, e.target.valueAsNumber)}
                    placeholder={`${itemName} ${idx + 1}`}
                    className="h-10 bg-slate-50/50 focus:bg-white text-slate-900 border-slate-200 focus:border-[#b7801a] focus:ring-[#b7801a]/20"
                  />
                )}
                {field.item_type === 'boolean' && (
                  <div className="flex items-center gap-2 pl-2">
                    <Checkbox
                      checked={item === true}
                      onCheckedChange={(checked) => updateItem(idx, checked)}
                      className="data-[state=checked]:bg-[#b7801a] border-slate-300 w-5 h-5"
                    />
                    <span className="text-sm text-slate-600">
                      {itemName} {idx + 1}
                    </span>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(idx)}
                className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className={cn(
              'w-full border-dashed hover:border-[#b7801a] hover:bg-[#b7801a]/5 hover:text-[#b7801a]',
              needsMore && 'border-red-300 text-red-600 hover:border-red-400'
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar {field.item_label ?? 'otro'}
          </Button>
        )}

        {needsMore && (
          <p className="text-xs text-red-500 font-medium">
            Mínimo {field.min_items} items requeridos
          </p>
        )}

        {!canAddMore && (
          <p className="text-xs text-slate-400 font-medium">
            Límite máximo alcanzado ({field.max_items} items)
          </p>
        )}
      </div>
    );
  }

  // Image & Array Fields
  if (
    field.type === 'image' ||
    (field.type === 'array' && field.item_type === 'image')
  ) {
    return (
      <ImageUploadField
        label={field.label}
        required={field.required}
        multiple={field.type === 'array'}
        maxItems={field.type === 'array' ? field.max_items : 1}
        value={value}
        onFiles={onFileUpload}
      />
    );
  }

  // Music Fields (YouTube + letra sincronizada)
  if (field.type === 'music') {
    return <SongPicker field={field} value={value} onChange={onChange} />;
  }

  // Textarea Fields
  if (field.type === 'textarea') {
    return (
      <div className="space-y-3">
        <Label
          htmlFor={field.name}
          className="text-base font-medium text-slate-700"
        >
          {field.label}{' '}
          {field.required && <span className="text-[#b7801a]">*</span>}
        </Label>
        <Textarea
          id={field.name}
          placeholder="Escribe aquí..."
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          maxLength={field.max_length}
          className="min-h-[120px] resize-y bg-slate-50/50 focus:bg-white text-slate-900 transition-all border-slate-200 focus:border-[#b7801a] focus:ring-[#b7801a]/20"
        />
        {field.max_length && (
          <div className="text-right text-xs text-slate-400 font-medium">
            {textValue.length} / {field.max_length}
          </div>
        )}
      </div>
    );
  }

  return null;
}
