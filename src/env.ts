import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {},

  clientPrefix: 'VITE_',

  client: {
    VITE_SUPABASE_URL: z.url(),
    VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    VITE_CULQI_LINK_9: z.url(),
    VITE_CULQI_LINK_11: z.url(),
  },

  runtimeEnv: import.meta.env,

  emptyStringAsUndefined: true,
});
