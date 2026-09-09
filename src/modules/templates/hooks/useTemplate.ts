import { useQuery } from '@tanstack/react-query';
import { TemplateService } from '../services';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => TemplateService.listTemplates(),
    staleTime: 1000 * 10,
    refetchOnMount: false,
  });
}

export function useTemplatesByPlan(planId: number) {
  return useQuery({
    queryKey: ['templates', 'plan', planId],
    queryFn: () => TemplateService.getTemplatesByPlanId(planId),
    staleTime: 1000 * 10,
    refetchOnMount: false,
    enabled: !!planId,
  });
}

export function useTemplateById(id: number) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => TemplateService.getTemplateById(id),
    staleTime: 1000 * 10,
    refetchOnMount: false,
    enabled: !!id,
  });
}
