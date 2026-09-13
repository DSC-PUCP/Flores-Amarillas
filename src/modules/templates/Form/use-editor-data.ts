import { useEffect, useMemo, useRef, useState } from 'react';
import type { TemplateData, TemplateFormStep } from '@/core/models/template';
import { formDefaults, templateDataSchema } from './editor-preview-protocol';

/** Las fotos locales se ven antes de subirlas; cada URL vive mientras se use su archivo. */
export function useEditorData(
  values: Record<string, unknown>,
  steps: TemplateFormStep[]
) {
  const schemaKey = JSON.stringify(steps);
  const schema = useMemo(
    () => JSON.parse(schemaKey) as TemplateFormStep[],
    [schemaKey]
  );
  const urls = useRef(new Map<File, string>());
  const [data, setData] = useState<TemplateData>({});
  useEffect(() => {
    const used = new Set<File>();
    const photoUrl = (value: unknown) => {
      if (!(value instanceof File))
        return typeof value === 'string' ? value : undefined;
      used.add(value);
      let url = urls.current.get(value);
      if (!url) {
        url = URL.createObjectURL(value);
        urls.current.set(value, url);
      }
      return url;
    };
    const next: Record<string, unknown> = {
      ...formDefaults(schema),
      ...values,
    };
    for (const field of schema.flatMap((step) => step.fields)) {
      if (field.type === 'image')
        next[field.name] = photoUrl(values[field.name] ?? next[field.name]);
      if (field.type === 'array' && field.item_type === 'image') {
        const photos = values[field.name];
        next[field.name] = Array.isArray(photos)
          ? photos.map(photoUrl).filter(Boolean)
          : [];
      }
    }
    for (const [file, url] of urls.current) {
      if (!used.has(file)) {
        URL.revokeObjectURL(url);
        urls.current.delete(file);
      }
    }
    const parsed = templateDataSchema.safeParse(next);
    if (parsed.success) setData(parsed.data);
  }, [values, schema]);
  useEffect(() => {
    const cache = urls.current;
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url);
      cache.clear();
    };
  }, []);
  return data;
}
