import { useLocation, useNavigate, useParams } from '@tanstack/react-router';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  X,
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
import { cn } from '@/lib/utils';
import { useTemplateById } from '../hooks/useTemplate';
import { useCreateLovepage } from './hooks/useLovePage';

export function TemplateForm() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const id = Number(params.id);

  const { data: template, isLoading, error } = useTemplateById(id);
  const createLovepageMutation = useCreateLovepage();

  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<FileUploadRef[]>([]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#e91e63]" />
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

  const steps = template.schemaJson || [];
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleFileUpload = (fieldName: string, uploadedFiles: File[]) => {
    if (uploadedFiles.length > 0) {
      const newFileRef: FileUploadRef = {
        key: fieldName,
        file: uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles,
      };
      setFiles((prev) => {
        const filtered = prev.filter((item) => item.key !== fieldName);
        return [...filtered, newFileRef];
      });
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateCurrentStep = () => {
    const missingFields = currentStepData.fields.filter((field) => {
      if (!field.required) return false;
      const val = formValues[field.name];
      if (val === undefined || val === null || val === '') return true;
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
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    createLovepageMutation.mutate(
      { templateId: id, configJson: formValues, files: files },
      {
        onSuccess: (data) => {
          if (!data) {
            toast.error('Error: No se recibió ID de la dedicatoria');
            return;
          }
          toast.success('¡Dedicatoria creada con éxito!');
          navigate({ to: `/lovepage/${data}` });
        },
        onError: (err: any) => {
          toast.error(err.message || 'Error al crear la dedicatoria');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex justify-center items-start">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {template.name}
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wide">
            <span>
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span>{Math.round(progress)}% Completado</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-slate-200"
            indicatorClassName="bg-[#e91e63]"
          />
        </div>

        {/* Current Step Card */}
        <Card className="border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white text-slate-900">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-xl pb-6">
            <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e91e63]/10 text-[#e91e63] text-sm font-bold">
                {currentStep + 1}
              </span>
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-slate-500">
              Completa la información para continuar.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 space-y-8 bg-white">
            {currentStepData.fields.map((field: any) => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={formValues[field.name]}
                onChange={(val) => handleChange(field.name, val)}
                onFileUpload={(files) => {
                  // Update form value for preview/state logic
                  if (field.type === 'array') handleChange(field.name, files);
                  else handleChange(field.name, files[0]);

                  // Update files state for submission
                  handleFileUpload(field.name, files);
                }}
              />
            ))}
          </CardContent>

          <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 rounded-b-xl py-6">
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
                onClick={handleSubmit}
                disabled={createLovepageMutation.isPending}
                className="bg-[#e91e63] hover:bg-[#d81b60] text-white min-w-[140px] shadow-lg shadow-[#e91e63]/20"
              >
                {createLovepageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Finalizar
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
      </div>
    </div>
  );
}

// --- Helper Component for Field Rendering ---

function FieldRenderer({ field, value, onChange, onFileUpload }: any) {
  // Date Fields
  if (field.type === 'date') {
    return (
      <div className="space-y-3">
        <Label
          htmlFor={field.name}
          className="text-base font-medium text-slate-700"
        >
          {field.label}{' '}
          {field.required && <span className="text-[#e91e63]">*</span>}
        </Label>
        <Input
          type="date"
          id={field.name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 bg-slate-50/50 focus:bg-white text-slate-900 transition-all border-slate-200 focus:border-[#e91e63] focus:ring-[#e91e63]/20"
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
          {field.required && <span className="text-[#e91e63]">*</span>}
        </Label>
        {isLongText ? (
          <Textarea
            id={field.name}
            placeholder="Escribe aquí..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            maxLength={field.max_length}
            className="min-h-[120px] resize-y bg-slate-50/50 focus:bg-white text-slate-900 transition-all border-slate-200 focus:border-[#e91e63] focus:ring-[#e91e63]/20"
          />
        ) : (
          <Input
            id={field.name}
            type={inputType}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            maxLength={field.max_length}
            className="h-11 bg-slate-50/50 focus:bg-white text-slate-900 transition-all border-slate-200 focus:border-[#e91e63] focus:ring-[#e91e63]/20"
          />
        )}
        {field.max_length && (
          <div className="text-right text-xs text-slate-400 font-medium">
            {value?.length || 0} / {field.max_length}
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
          {field.required && <span className="text-[#e91e63]">*</span>}
        </Label>
        <Input
          type="number"
          id={field.name}
          value={value || ''}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          className="h-11 bg-slate-50/50 focus:bg-white text-slate-900 transition-all border-slate-200 focus:border-[#e91e63] focus:ring-[#e91e63]/20"
        />
      </div>
    );
  }

  // Boolean Fields
  if (field.type === 'boolean') {
    return (
      <div
        className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 hover:border-[#e91e63]/50 hover:bg-[#e91e63]/5 transition-all cursor-pointer bg-white"
        onClick={() => onChange(!value)}
      >
        <Checkbox
          id={field.name}
          checked={!!value}
          onCheckedChange={(checked) => onChange(checked)}
          className="data-[state=checked]:bg-[#e91e63] border-slate-300 w-5 h-5"
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
  if (
    field.type === 'array' &&
    field.item_type !== 'image'
  ) {
    const items = Array.isArray(value) ? value : [];
    const canAddMore = !field.max_items || items.length < field.max_items;
    const needsMore = field.min_items && items.length < field.min_items;

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

    const updateItem = (index: number, newValue: any) => {
      const updated = [...items];
      updated[index] = newValue;
      onChange(updated);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium text-slate-700">
            {field.label}{' '}
            {field.required && <span className="text-[#e91e63]">*</span>}
          </Label>
          <span className="text-xs text-slate-400 font-medium">
            {items.length}
            {field.max_items ? ` / ${field.max_items}` : ''} items
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 bg-white group hover:border-slate-300 transition-colors"
            >
              <div className="flex-1">
                {field.item_type === 'string' && (
                  <div className="space-y-1">
                    <Input
                      type="text"
                      value={item}
                      onChange={(e) => updateItem(idx, e.target.value)}
                      placeholder={`${field.label} ${idx + 1}`}
                      maxLength={field.item_max_length}
                      className="h-10 bg-slate-50/50 focus:bg-white text-slate-900 border-slate-200 focus:border-[#e91e63] focus:ring-[#e91e63]/20"
                    />
                    {field.item_max_length && (
                      <div className="text-right text-[10px] text-slate-400 font-medium">
                        {item?.length || 0} / {field.item_max_length}
                      </div>
                    )}
                  </div>
                )}
                {field.item_type === 'number' && (
                  <Input
                    type="number"
                    value={item}
                    onChange={(e) => updateItem(idx, e.target.valueAsNumber)}
                    placeholder={`${field.label} ${idx + 1}`}
                    className="h-10 bg-slate-50/50 focus:bg-white text-slate-900 border-slate-200 focus:border-[#e91e63] focus:ring-[#e91e63]/20"
                  />
                )}
                {field.item_type === 'boolean' && (
                  <div className="flex items-center gap-2 pl-2">
                    <Checkbox
                      checked={!!item}
                      onCheckedChange={(checked) => updateItem(idx, checked)}
                      className="data-[state=checked]:bg-[#e91e63] border-slate-300 w-5 h-5"
                    />
                    <span className="text-sm text-slate-600">
                      {field.label} {idx + 1}
                    </span>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(idx)}
                className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
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
              'w-full border-dashed hover:border-[#e91e63] hover:bg-[#e91e63]/5 hover:text-[#e91e63]',
              needsMore && 'border-red-300 text-red-600 hover:border-red-400'
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar {field.label}
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
    const isMultiple = field.type === 'array';
    const hasValue = value && (isMultiple ? value.length > 0 : !!value);

    return (
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700">
          {field.label}{' '}
          {field.required && <span className="text-[#e91e63]">*</span>}
        </Label>

        <div
          className={cn(
            'relative border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out group overflow-hidden min-h-[160px] flex flex-col items-center justify-center text-center p-6 cursor-pointer bg-white',
            hasValue
              ? 'border-[#e91e63]/30 bg-[#e91e63]/5'
              : 'border-slate-300 hover:border-[#e91e63] hover:bg-slate-50'
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple={isMultiple}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              if (files.length) onFileUpload(files);
            }}
          />

          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 shadow-sm',
              hasValue
                ? 'bg-[#e91e63]/10 text-[#e91e63]'
                : 'bg-white text-slate-400 group-hover:bg-[#e91e63]/10 group-hover:text-[#e91e63]'
            )}
          >
            {hasValue ? (
              <Check className="w-6 h-6" />
            ) : (
              <CloudUpload className="w-6 h-6" />
            )}
          </div>

          <h3 className="font-semibold text-slate-800">
            {hasValue
              ? isMultiple
                ? `${value.length} archivos seleccionados`
                : 'Imagen lista'
              : 'Arrastra tus fotos aquí'}
          </h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
            {hasValue
              ? 'Haz clic o arrastra para cambiar'
              : isMultiple
                ? `Sube hasta ${field.max_items || 5} fotos`
                : 'Soporta PNG, JPG, WEBP'}
          </p>
        </div>

        {/* Image Previews */}
        {hasValue && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
            {isMultiple ? (
              value.map((file: File, idx: number) => (
                <ImagePreview key={idx} file={file} />
              ))
            ) : (
              <ImagePreview file={value} />
            )}
          </div>
        )}
      </div>
    );
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
          {field.required && <span className="text-[#e91e63]">*</span>}
        </Label>
        <Textarea
          id={field.name}
          placeholder="Escribe aquí..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={field.max_length}
          className="min-h-[120px] resize-y bg-slate-50/50 focus:bg-white text-slate-900 transition-all border-slate-200 focus:border-[#e91e63] focus:ring-[#e91e63]/20"
        />
        {field.max_length && (
          <div className="text-right text-xs text-slate-400 font-medium">
            {value?.length || 0} / {field.max_length}
          </div>
        )}
      </div>
    );
  }


  return null;
}

function ImagePreview({ file }: { file: File | string }) {
  const src = file instanceof File ? URL.createObjectURL(file) : file;
  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden bg-white shadow-sm border border-slate-100">
      <img src={src} alt="Preview" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    </div>
  );
}