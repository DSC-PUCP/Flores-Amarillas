import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    SERVER_URL: z.url().optional(),

    FLOW_API_KEY: z.string().min(1).optional(),
    FLOW_SECRET_KEY: z.string().min(1).optional(),
    FLOW_MODE: z.enum(['sandbox', 'production']).default('sandbox'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

    // YouTube Data API v3. Sin clave, el formulario pide pegar el link.
    YOUTUBE_API_KEY: z.string().min(1).optional(),
  },

  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_SUPABASE_URL: z.url(),
    VITE_SUPABASE_KEY: z.string(),
    VITE_SERVER_URL: z.url().optional(),

  },

  runtimeEnv: {
    ...import.meta.env,
    FLOW_API_KEY: process.env.FLOW_API_KEY,
    FLOW_SECRET_KEY: process.env.FLOW_SECRET_KEY,
    FLOW_MODE: process.env.FLOW_MODE,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SERVER_URL: process.env.SERVER_URL,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },

  emptyStringAsUndefined: true,
});
