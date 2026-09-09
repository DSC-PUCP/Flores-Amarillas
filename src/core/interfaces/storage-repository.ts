import type { Result } from '@/lib/utils';

export type UploadImageParams = {
  file: File;
  pageId: string;
  fileId: string;
};

export type StorageRepository = {
  uploadImage: (params: UploadImageParams) => Promise<Result<string | null>>;
};
