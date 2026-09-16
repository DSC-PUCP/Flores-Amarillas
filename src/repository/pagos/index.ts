import type {
  PagoRepository,
  RegistrarPagoInput,
} from '@/core/interfaces/pago-repository';
import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';

export const pagoRepository: PagoRepository = {
  registrar: async (input: RegistrarPagoInput) => {
    const supabase = getSupabaseClient();
    // Sin `.select()` a proposito: `pagos` no tiene policy de lectura, y el
    // RETURNING de PostgREST necesita permiso de SELECT. Pedir la fila de
    // vuelta haria fallar una insercion que en realidad si entro.
    const { error } = await supabase.from('pagos').insert({
      page_id: input.pageId,
      nombre: input.nombre,
      correo: input.correo,
      comprobante_url: input.comprobanteUrl,
      enlace: input.enlace,
    });

    if (error) return Result.error(new Error(error.message));
    return Result.success();
  },
};
