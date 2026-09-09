import type { TemplateRepository } from '@/core/interfaces/template-repository';
import type { Template, TemplateField } from '@/core/models';
import type { TemplateForm } from '@/core/models/template';
import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';
import type { Database } from '@/repository/database.types';

type TemplateRow = Database['public']['Tables']['templates']['Row'];

const mapRowToTemplate = (row: TemplateRow): Template => {
  return {
    id: row.id,
    templateKey: row.template_key,
    name: row.name,
    description: row.description,
    schemaJson: row.schema_json as TemplateForm,
    planId: row.plan_id,
    previewImageUrl: row.preview_image_url??"",
    isVisible: row.is_visible>0
  };
};

export const templateRepository: TemplateRepository = {
  list: async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('templates').select('*');

    if (error) return Result.error(new Error(error.message));
    return Result.success((data ?? []).map(mapRowToTemplate));
  },

  getById: async (id: number) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return Result.error(new Error(error.message));
    if (!data) return Result.success(null);
    return Result.success(mapRowToTemplate(data));
  },

  getByPlanId: async (planId: number) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('plan_id', planId);

    if (error) return Result.error(new Error(error.message));
    return Result.success((data ?? []).map(mapRowToTemplate));
  },
};
