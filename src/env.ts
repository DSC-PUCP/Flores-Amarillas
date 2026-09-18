import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    SERVER_URL: z.url().optional(),

    FLOW_API_KEY: z.string().min(1).optional(),
    FLOW_SECRET_KEY: z.string().min(1).optional(),
    FLOW_MODE: z.enum(['sandbox', 'production']).default('sandbox'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  },

  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_SUPABASE_URL: z.url(),
    VITE_SUPABASE_KEY: z.string(),
    VITE_SERVER_URL: z.url().optional(),

    /*
     * El WhatsApp al que se manda a quien compra con un codigo con precio.
     * Solo digitos y con codigo de pais, como lo quiere wa.me: 51951722132.
     *
     * Opcional para que la app siga arrancando sin el —en local, o en un
     * despliegue que aun no lo tenga puesto—; el boton avisa en vez de mandar
     * a un chat vacio. Ya estaba declarada en el workflow de deploy y no la
     * leia nadie.
     */
    VITE_WHATSAPP_PHONE: z
      .string()
      .regex(/^\d{8,15}$/, 'Solo digitos, con codigo de pais y sin +')
      .optional(),
  },

  runtimeEnv: {
    ...import.meta.env,
    FLOW_API_KEY: process.env.FLOW_API_KEY,
    FLOW_SECRET_KEY: process.env.FLOW_SECRET_KEY,
    FLOW_MODE: process.env.FLOW_MODE,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SERVER_URL: process.env.SERVER_URL,
  },

  emptyStringAsUndefined: true,
});
