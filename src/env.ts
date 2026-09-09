import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    SERVER_URL: z.url().optional(),

    API_SECRET: z.string().min(1).optional(),
  },

  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_SUPABASE_URL: z.url(),
    VITE_SUPABASE_KEY: z.string(),
    VITE_SERVER_URL: z.string().optional(),

    // Numero de WhatsApp de ventas, formato internacional sin + ni espacios
    VITE_WHATSAPP_PHONE: z.string().min(9),
  },

  runtimeEnv: {
    ...import.meta.env,
    API_SECRET: process.env.API_SECRET,
    SERVER_URL: process.env.SERVER_URL,
  },

  emptyStringAsUndefined: true,
});
