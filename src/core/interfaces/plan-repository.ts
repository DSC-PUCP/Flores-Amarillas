import type { Plan } from '@/core/models';
import type { Result } from '@/lib/utils';

export type PlanRepository = {
  list: () => Promise<Result<Plan[]>>;
  getById: (id: number) => Promise<Result<Plan | null>>;
};
