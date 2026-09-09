import type React from 'react';
import type { TemplateData } from '@/core';
import { TEMPLATE_COMPONENTS } from './config/template-components';

interface TemplateRendererProps {
  templateKey: string;
  templateData: TemplateData;
  isPreview?: boolean;
  templateId?: number;
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
}: TemplateRendererProps) {
  const TemplateComponent = TEMPLATE_COMPONENTS[templateKey] || DefaultTemplate;
  return (
    <TemplateComponent templateData={templateData} isPreview={isPreview} />
  );
}
