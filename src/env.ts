import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {},

  clientPrefix: 'VITE_',

  client: {
    VITE_SUPABASE_URL: z.url(),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    VITE_SERVER_URL: z.url().optional(),

    /*
     * Los enlaces de pago de Culqi, uno por precio de plan.
     *
     * Son enlaces creados a mano en el panel de Culqi, no una integracion por
     * API: por eso viven en el entorno y no en la base. `VITE_` porque el
     * navegador los abre y no tienen nada secreto —cualquiera que llegue a la
     * pagina de pago ve la misma direccion—.
     *
     * Opcionales a proposito. Venian como `z.url()` obligatorias y eso impedia
     * arrancar la app a quien no los tuviera —en local, o en un despliegue que
     * aun no los haya puesto—; sin ellos el cobro cae al Yape de siempre, que
     * es justo el respaldo que ya estaba escrito.
     */
    VITE_CULQI_LINK_9: z.url().optional(),
    VITE_CULQI_LINK_11: z.url().optional(),

    /*
     * El WhatsApp al que se manda a quien compra con un codigo con precio.
     * Solo digitos y con codigo de pais, como lo quiere wa.me: 51951722132.
     *
     * Opcional para que la app siga arrancando sin el; el boton avisa en vez
     * de mandar a un chat vacio.
     */
    VITE_WHATSAPP_PHONE: z
      .string()
      .regex(/^\d{8,15}$/, 'Solo digitos, con codigo de pais y sin +')
      .optional(),
  },

  runtimeEnv: import.meta.env,

  emptyStringAsUndefined: true,
});
