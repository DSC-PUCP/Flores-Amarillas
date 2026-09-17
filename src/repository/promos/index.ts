import type {
  CanjearPromoInput,
  PromoRepository,
} from '@/core/interfaces/promo-repository';
import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';

export const promoRepository: PromoRepository = {
  revisar: async (codigo: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('revisar_promo', {
      codigo_promo: codigo,
    });

    if (error) return Result.error(new Error(error.message));

    // La funcion devuelve siempre una fila, pero PostgREST la entrega dentro
    // de un array. Si llegara vacio, tratarlo como codigo inexistente es lo
    // unico que no regala nada por error.
    const fila = data?.[0];
    if (!fila) return Result.success({ estado: 'inexistente', precio: null });
    return Result.success({ estado: fila.estado, precio: fila.precio });
  },
  canjear: async (input: CanjearPromoInput) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('canjear_promo', {
      codigo_promo: input.codigo,
      pagina: input.pageId,
    });

    // El mensaje viene de un `raise exception` de la funcion y esta escrito
    // para que se pueda mostrar tal cual: "Ese codigo ya se agoto".
    if (error) return Result.error(new Error(error.message));
    return Result.success(Number(data ?? 0));
  },
};
