import type { TemplateData } from '@/core/models/template';

/**
 * `templateData` es un diccionario sin tipar que viene del formulario: puede
 * faltar la clave, venir vacia o venir con otra forma en paginas viejas. Estas
 * dos funciones son el unico sitio donde se decide que hacer en ese caso.
 */
export function readText(
  data: TemplateData,
  key: string,
  fallback = ''
): string {
  const value = data[key];
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed === '' ? fallback : trimmed;
}

/** Las imagenes llegan como URL publica ya subida a Storage, o no llegan. */
export function readImage(data: TemplateData, key: string): string | undefined {
  const value = data[key];
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}
