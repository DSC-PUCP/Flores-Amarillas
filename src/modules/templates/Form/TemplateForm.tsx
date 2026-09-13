import { useNavigate, useParams } from '@tanstack/react-router';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
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
import { MascotPicker } from '@/modules/templates/components/templates/plantilla_giano_feat_leo/components/mascot-picker';
import { readGiftMascot } from '@/modules/templates/components/templates/plantilla_giano_feat_leo/mascots';
import { useTemplateById } from '../hooks/useTemplate';
import { EditorPreview } from './editor-preview';
import {
  type EditorScene,
  fieldScene,
  formDefaults,
  stepScene,
} from './editor-preview-protocol';
import { useCreateLovepage } from './hooks/useLovePage';
import { ImageUploadField } from './image-upload-field';
import { useEditorData } from './use-editor-data';

const EMPTY_STEPS: import('@/core/models/template').TemplateForm = [];

export function TemplateForm() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const id = Number(params.id);

  const { data: template, isLoading, error } = useTemplateById(id);
  const createLovepageMutation = useCreateLovepage();

  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<FileUploadRef[]>([]);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [scene, setScene] = useState<EditorScene | null>(null);
  const [revision, setRevision] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const steps = template?.schemaJson ?? EMPTY_STEPS;
  const previewData = useEditorData(formValues, steps);

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
          navigate({ to: `/lovepage/${data}` });
        },
        onError: (err) => {
          toast.error(err.message || 'Error al crear la dedicatoria');
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
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => editStep(currentStep)}>
                Seguir editando
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createLovepageMutation.isPending}
                className="bg-[#183E32] text-white hover:bg-[#285642]"
              >
                {createLovepageMutation.isPending ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Check size={16} className="mr-2" />
                )}{' '}
                Crear mi regalo
              </Button>
            </div>
          </section>
        )}
        <div
          role="tablist"
          aria-label="Editor del regalo"
          className="grid grid-cols-2 gap-2 rounded-2xl bg-[#183E32]/5 p-1.5 lg:hidden"
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
              mobileTab !== 'edit' && 'hidden lg:block'
            )}
          >
            {reviewing ? (
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
                          value={formValues[field.name]}
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
              mobileTab !== 'preview' && 'hidden lg:block'
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
                : 'Los cambios se muestran aquí. Tu regalo se guarda cuando pulses “Crear mi regalo”.'}
            </p>
          </section>
        </div>
      </div>
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
