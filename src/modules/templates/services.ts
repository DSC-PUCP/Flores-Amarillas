import type { Template } from '@/core';
import { PlanService } from '@/modules/plan/services';
import { templateRepository } from '@/repository';
import { TEMPLATES_CATALOG } from './components/config/template-components';

const enrichTemplateWithCatalogSchema = (template: Template): Template => {
  const catalogConfig = TEMPLATES_CATALOG[template.templateKey];
  if (catalogConfig) {
    return {
      ...template,
      schemaJson: catalogConfig.templateForm,
    };
  }
  return template;
};

export namespace TemplateService {
  export const listTemplates = async () => {
    const result = await templateRepository.list();
    if (result.isFailure()) throw new Error(result.getError()?.message);
    const templates = result.getValue() ?? [];

    // Obtener todos los planes
    const plans = await PlanService.listPlans();
    // Crear un mapa de planId -> nombre del plan
    const planMap = new Map(plans.map((plan) => [plan.id, plan.name]));

    return templates.map((template) => {
      const enriched = enrichTemplateWithCatalogSchema(template);
      // Agregar el nombre del plan como tipoPlan
      return {
        ...enriched,
        tipoPlan: planMap.get(template.planId),
      };
    });
  };

  export const getTemplateById = async (id: number) => {
    const result = await templateRepository.getById(id);
    if (result.isFailure()) throw new Error(result.getError()?.message);
    const template = result.getValue();

    if (!template) return template;

    return enrichTemplateWithCatalogSchema(template);
  };

  export const getTemplatesByPlanId = async (planId: number) => {
    const result = await templateRepository.getByPlanId(planId);
    if (result.isFailure()) throw new Error(result.getError()?.message);
    const templates = result.getValue() ?? [];

    return templates.map(enrichTemplateWithCatalogSchema);
  };
}
