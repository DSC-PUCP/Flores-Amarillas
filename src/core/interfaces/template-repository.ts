import type { Result } from '@/lib/utils';
import type { Template } from '../models/template';

export type TemplateRepository = {
  list: () => Promise<Result<Template[]>>;
  getById: (id: number) => Promise<Result<Template | null>>;
  getByPlanId: (planId: number) => Promise<Result<Template[]>>;
};
