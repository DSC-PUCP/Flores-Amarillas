import type { Result } from '@/lib/utils';
import type { Media } from '../models/media';

export type CreateMediaInput = {
  pageId: string;
  filePath: string;
  fileType: string;
};

export type MediaRepository = {
  getById: (id: string) => Promise<Result<Media | null>>;
  create: (input: CreateMediaInput) => Promise<Result<string | null>>;
};
