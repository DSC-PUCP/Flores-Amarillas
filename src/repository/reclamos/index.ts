import type {
  ReclamoRepository,
  RegistrarReclamoInput,
} from '@/core/interfaces/reclamo-repository';
import getSupabaseClient from '@/lib/supabase';
import { Result } from '@/lib/utils';

export const reclamoRepository: ReclamoRepository = {
  registrar: async (input: RegistrarReclamoInput) => {
    const supabase = getSupabaseClient();

    // Por RPC y no por `insert`: la tabla no admite escritura desde el
    // navegador, y ademas el correlativo lo pone la base —contarlo aqui daria
    // el mismo numero a dos personas que envien a la vez—.
    const { data, error } = await supabase.rpc('registrar_reclamo', {
      p_tipo: input.tipo,
      p_nombre: input.nombre.trim(),
      p_tipo_documento: input.tipoDocumento,
      p_documento: input.documento.trim(),
      p_domicilio: input.domicilio.trim(),
      p_correo: input.correo.trim(),
      p_telefono: input.telefono.trim(),
      p_tipo_bien: input.tipoBien,
      p_descripcion: input.descripcion.trim(),
      p_detalle: input.detalle.trim(),
      p_pedido: input.pedido.trim(),
      p_monto: input.monto ?? null,
      p_apoderado: input.apoderado?.trim() || null,
    });

    if (error) return Result.error(new Error(error.message));
    if (!data) {
      return Result.error(
        new Error('No se pudo registrar tu reclamo. Vuelve a intentarlo.')
      );
    }

    return Result.success(data as string);
  },
};
