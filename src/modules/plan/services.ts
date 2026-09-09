import { planRepository } from '@/repository';

export namespace PlanService {
  export const listPlans = async () => {
    const result = await planRepository.list();
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue() ?? [];
  };

  export const getPlanById = async (id: number) => {
    const result = await planRepository.getById(id);
    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue();
  };
}
