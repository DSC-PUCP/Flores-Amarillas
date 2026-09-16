import type {
  StorageRepository,
  UploadComprobanteParams,
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

  uploadComprobante: async ({ file, pageId }: UploadComprobanteParams) => {
    const supabase = getSupabaseClient();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    // Nombre aleatorio y no el del archivo del cliente: los nombres de las
    // capturas se repiten (IMG_1399.jpeg) y con `upsert: false` el segundo
    // pago del dia chocaria contra el primero.
    const filePath = `comprobantes/${pageId}/${crypto.randomUUID()}.${fileExt}`;

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
