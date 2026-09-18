import type React from 'react';
import type { TemplateData } from '@/core';
import { TEMPLATE_COMPONENTS } from './config/template-components';
import { MarcaDeAgua } from './MarcaDeAgua';

interface TemplateRendererProps {
  templateKey: string;
  templateData: TemplateData;
  isPreview?: boolean;
  templateId?: number;
  /**
   * Tapa el regalo con "Vista Previa".
   *
   * Es una prop aparte y no `isPreview` a proposito. `isPreview` significa
   * tres cosas distintas segun quien renderice: la pagina sin pagar, el
   * preview en vivo del editor y la demo de la landing. Colgar la marca de
   * agua de ahi la pondria encima del cliente mientras escribe su regalo y
   * encima del ejemplo que usamos para vender.
   *
   * Por defecto no se marca nada: quien quiera la marca tiene que pedirla.
   */
  marcaDeAgua?: boolean;
  /**
   * Aviso de que la plantilla llego a su ultima pantalla.
   *
   * Solo lo usan las paginas de ejemplo, para poner delante el cierre con
   * "Gracias por ver este ejemplo". Un regalo de verdad no pasa nada: quien lo
   * recibe se queda en la ultima pantalla, que es donde debe quedarse.
   *
   * No todas las plantillas avisan; las que se pasean en vez de recorrerse no
   * tienen ultima pantalla. Ver `MODO_FIN` en `config/ejemplos.ts`.
   */
  onComplete?: () => void;
}

// Default fallback template
function DefaultTemplate({
  templateData,
}: {
  templateData: TemplateData;
  isPreview?: boolean;
}) {
  // templateData is intentionally not used; type is included for consistency with other templates
  void templateData;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-8">
      <p className="text-sm text-slate-400">No se encontró la plantilla</p>
    </div>
  );
}

export function TemplateRenderer({
  templateKey,
  templateData,
  isPreview = true,
  templateId,
  marcaDeAgua = false,
  onComplete,
}: TemplateRendererProps) {
  const TemplateComponent = TEMPLATE_COMPONENTS[templateKey] || DefaultTemplate;
  return (
    <>
      <TemplateComponent
        templateData={templateData}
        isPreview={isPreview}
        onComplete={onComplete}
      />
      {marcaDeAgua && <MarcaDeAgua />}
    </>
  );
}
