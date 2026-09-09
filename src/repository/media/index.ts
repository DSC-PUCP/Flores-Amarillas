import type {
  CreateMediaInput,
  MediaRepository,
} from '@/core/interfaces/media-repository';
import type { Media } from '@/core/models/media';
import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';
import type { Database } from '@/repository/database.types';

type FilesRow = Database['public']['Tables']['files']['Row'];

const mapRowToFiles = (row: FilesRow): Media => {
  const media = {
    id: row.id,
    pageId: row.page_id,
    filePath: row.file_path,
    fileType: row.file_type,
  };
  return media;
};

export const mediaRepository: MediaRepository = {
  getById: async (id: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return Result.error(new Error(error.message));
    if (!data) return Result.success(null);
    return Result.success(mapRowToFiles(data));
  },
  create: async (input: CreateMediaInput) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('files')
      .insert({
        page_id: input.pageId,
        file_path: input.filePath,
        file_type: input.fileType,
      })
      .select('id')
      .single();

    if (error) return Result.error(new Error(error.message));
    if (!data) return Result.success(null);
    return Result.success(data.id);
  },
};
