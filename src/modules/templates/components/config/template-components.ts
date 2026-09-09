import type React from 'react';
import type { TemplateConfig, TemplateData, TemplateForm } from '@/core';
import { AmorEternoTemplate, HistoriaDeDosTemplate, JuntosPorSiempreTemplate, Plantilla1, Plantilla2, PlantillaGianoFeatLeo, PlantillaGratuita, plantillaGianoFeatLeoConfig, plantillaGratuitaConfig } from '../templates';

// Map template IDs to their components
export const TEMPLATE_COMPONENTS: Record<
  string,
  React.FC<{ templateData: TemplateData; isPreview?: boolean }>
> = {
  'amor-eterno': AmorEternoTemplate,
  'juntos-por-siempre': JuntosPorSiempreTemplate,
  'historia-de-dos': HistoriaDeDosTemplate,
  'pamela_v1': Plantilla1,
  'free_template': Plantilla2,
  'plantilla_gratuita': PlantillaGratuita,
  'plantilla_giano_feat_leo': PlantillaGianoFeatLeo
};


// Template configuration catalog with form schemas
export const TEMPLATES_CATALOG: Record<string, TemplateConfig> = {
  'plantilla_gratuita': plantillaGratuitaConfig,
  'plantilla_giano_feat_leo': plantillaGianoFeatLeoConfig
};

