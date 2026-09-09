import { useQuery } from '@tanstack/react-query';
import { LandingService } from '../services';

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => LandingService.listPlans(),
    staleTime: 1000 * 10,
    refetchOnMount: false,
  });
}
