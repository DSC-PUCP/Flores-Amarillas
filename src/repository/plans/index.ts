import type { PlanRepository } from '@/core/interfaces/plan-repository';
import type { Plan } from '@/core/models';
import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';
import type { Database } from '@/repository/database.types';

type PlanRow = Database['public']['Tables']['plans']['Row'];

const mapRowToPlan = (row: PlanRow): Plan => {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    features: row.features as string[],
    description: row.description
  };
};

export const planRepository: PlanRepository = {
  list: async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('plans').select('*');

    if (error) return Result.error(new Error(error.message));
    return Result.success((data ?? []).map(mapRowToPlan));
  },

  getById: async (id: number) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return Result.error(new Error(error.message));
    if (!data) return Result.success(null);
    return Result.success(mapRowToPlan(data));
  },
};
