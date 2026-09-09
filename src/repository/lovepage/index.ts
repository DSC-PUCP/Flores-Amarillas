import type {
  CreateLovepageInput,
  LovepageRepository,
} from '@/core/interfaces/lovepage-repository';
import type { Lovepage, TemplateData } from '@/core/models';
import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';
import type { Database } from '@/repository/database.types';

type LovepageRow = Database['public']['Tables']['pages']['Row'];

const mapRowToLovepage = (row: LovepageRow): Lovepage => {
  return {
    id: row.id,
    templateId: row.template_id,
    configJson: row.config_json as TemplateData,
    isPaid: row.is_paid ?? false,
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
  };
};

export const lovepageRepository: LovepageRepository = {
  getById: async (id: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return Result.error(new Error(error.message));
    if (!data) return Result.success(null);
    return Result.success(mapRowToLovepage(data));
  },
  createLovepage: async (input: CreateLovepageInput) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pages')
      .insert({
        ...(input.id && { id: input.id }),
        template_id: input.templateId,
        config_json: input.configJson,
        is_paid: false,
        expires_at: input.expiresAt?.toISOString() ?? null,
      })
      .select('id')
      .single();

    if (error) return Result.error(new Error(error.message));
    if (!data) return Result.success(null);
    return Result.success(data.id);
  },
  activate: async (id: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.rpc('activate_love_page', {
      target_page_id: id,
    });

    if (error) return Result.error(new Error(error.message));
    return Result.success(undefined);
  },
};
