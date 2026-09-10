import type {
  StorageRepository,
  UploadImageParams,
} from '@/core/interfaces/storage-repository';
import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';

const BUCKET_NAME = 'flores-amarillas';

export const storageRepository: StorageRepository = {
  uploadImage: async ({ file, pageId, fileId }: UploadImageParams) => {
    const supabase = getSupabaseClient();
    const fileExt = file.name.split('.').pop();
    const filePath = `pages/${pageId}/${fileId}.${fileExt}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) return Result.error(new Error(error.message));
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    if (!data) return Result.error(new Error('No data returned from upload'));
    return Result.success(data.publicUrl);
  },
};
