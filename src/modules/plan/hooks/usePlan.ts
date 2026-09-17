import { useQuery } from '@tanstack/react-query';
import { PlanService } from '../services';

export function usePlanById(id: number) {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: () => PlanService.getPlanById(id),
    staleTime: 1000 * 10,
    refetchOnMount: false,
    enabled: !!id,
  });
}
