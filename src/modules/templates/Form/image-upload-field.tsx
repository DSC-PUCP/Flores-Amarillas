import { ArrowLeft, ArrowRight, ImagePlus, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';

type ImageUploadFieldProps = {
  label: string;
  required: boolean;
  multiple: boolean;
  maxItems?: number;
  value: unknown;
  onFiles: (files: File[]) => void;
};

export function ImageUploadField({
  label,
  required,
  multiple,
  maxItems = 12,
  value,
  onFiles,
}: ImageUploadFieldProps) {
  const id = useId();
  const [error, setError] = useState('');
  const files = (Array.isArray(value) ? value : [value]).filter(
    (item): item is File => item instanceof File
  );
  const limit = multiple ? maxItems : 1;
  const addFiles = (incoming: File[]) => {
    if (!incoming.length) return;
    const images = incoming.filter((file) => file.type.startsWith('image/'));
    if (images.length !== incoming.length) {
      setError('Selecciona archivos de imagen.');
      return;
    }
    const combined = multiple ? [...files] : [];
    for (const file of images) {
      if (
        !combined.some(
          (other) =>
            other.name === file.name &&
            other.size === file.size &&
            other.lastModified === file.lastModified
        )
      ) {
        combined.push(file);
      }
    }
    setError(
      combined.length > limit
        ? `Puedes subir hasta ${limit} fotos. Se conservaron las primeras ${limit}.`
        : ''
    );
    onFiles(combined.slice(0, limit));
  };
  const move = (index: number, step: number) => {
    const reordered = [...files];
    [reordered[index], reordered[index + step]] = [
      reordered[index + step],
      reordered[index],
    ];
    onFiles(reordered);
  };

  return (
    <div className="space-y-4">
      <label
        htmlFor={id}
        className="block text-base font-medium text-slate-700"
      >
        {label} {required && <span className="text-amber-700">*</span>}
      </label>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: arrastrar complementa el input de archivos accesible por teclado */}
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 text-center',
          files.length >= limit && 'border-slate-300'
        )}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <ImagePlus
          className="mx-auto mb-3 size-8 text-amber-700"
          aria-hidden="true"
        />
        <label
          htmlFor={id}
          className="cursor-pointer font-semibold text-slate-800"
        >
          {files.length
            ? multiple
              ? 'Añadir más fotos'
              : 'Cambiar foto'
            : 'Seleccionar o arrastrar fotos'}
        </label>
        <input
          id={id}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-describedby={`${id}-hint ${id}-error`}
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
            event.target.value = '';
          }}
        />
        <p id={`${id}-hint`} className="mt-2 text-sm text-slate-500">
          {multiple
            ? `${files.length} / ${limit} fotos · Puedes añadirlas en varias selecciones.`
            : 'PNG, JPG o WEBP · La foto se mostrará completa.'}
        </p>
      </div>
      <output id={`${id}-error`} className="block text-sm text-red-600">
        {error}
      </output>
      {files.length > 0 && (
        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <FilePreview file={file} index={index} />
              <div className="space-y-2 p-2">
                <p className="truncate text-xs text-slate-600">
                  {index + 1}. {file.name}
                </p>
                <div className="flex justify-between gap-1">
                  {multiple && (
                    <>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        aria-label={`Mover foto ${index + 1} antes`}
                        className="grid size-9 place-items-center rounded-lg hover:bg-amber-50 disabled:opacity-25"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={index === files.length - 1}
                        onClick={() => move(index, 1)}
                        aria-label={`Mover foto ${index + 1} después`}
                        className="grid size-9 place-items-center rounded-lg hover:bg-amber-50 disabled:opacity-25"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      onFiles(
                        files.filter((_, itemIndex) => index !== itemIndex)
                      );
                    }}
                    aria-label={`Quitar foto ${index + 1}`}
                    className="ml-auto grid size-9 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function FilePreview({ file, index }: { file: File; index: number }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return (
    <img
      src={src || undefined}
      alt={`Foto seleccionada ${index + 1}`}
      className="aspect-[4/3] w-full bg-amber-50 object-contain"
    />
  );
}
