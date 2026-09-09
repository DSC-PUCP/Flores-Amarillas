import type { Result } from '@/lib/utils';
import { lovepageRepository } from '@/repository/lovepage';

export const activateLovePage = async (id: string): Promise<Result<void>> => {
  return await lovepageRepository.activate(id);
};
