import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createIsomorphicFn } from '@tanstack/react-start';
import { getCookies, setCookie } from '@tanstack/react-start/server';
import { env } from '@/env';
import type { Database } from '@/repository/database.types';

const getSupabaseServerClient = () =>
  createServerClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_KEY, {
    cookies: {
      getAll: () => {
        const cookies = getCookies();
        return Object.entries(cookies).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          setCookie(name, value, options);
        });
      },
    },
  });

const getSupabaseBrowserClient = () =>
  createBrowserClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_KEY);

const getSupabaseClient = createIsomorphicFn()
  .server(() => getSupabaseServerClient())
  .client(() => getSupabaseBrowserClient());

export default getSupabaseClient;
