import type { Result } from '@/lib/utils';
import type { Lovepage, TemplateData } from '../models';

export type CreateLovepageInput = {
  id?: string;
  templateId: number;
  configJson: TemplateData;
  expiresAt: Date | null;
};

export type LovepageRepository = {
  getById: (id: string) => Promise<Result<Lovepage | null>>;
  createLovepage: (
    input: CreateLovepageInput
  ) => Promise<Result<string | null>>;
  activate: (id: string) => Promise<Result<void>>;
};
