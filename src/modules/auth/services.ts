import { redirect } from '@tanstack/react-router';
import getSupabaseClient from '@/lib/supabase';

export namespace AuthService {
  export const login = async () => {
    const { error } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${globalThis.location.origin}/api/auth/callback`,
      },
    });
    if (error) throw error;
  };

  export const getUser = async () => {
    const { data, error } = await getSupabaseClient().auth.getUser();
    if (error) throw error;
    return {
      id: data.user.id as string,
      email: data.user.email as string,
      avatar: data.user.user_metadata.avatar_url as string,
      fullName: data.user.user_metadata.full_name as string,
    };
  };

  export const getSession = async () => {
    const {
      data: { session },
      error,
    } = await getSupabaseClient().auth.getSession();
    if (error) throw error;
    return {
      id: session?.user.id as string,
      email: session?.user.email as string,
      avatar: session?.user.user_metadata.avatar_url as string,
      fullName: session?.user.user_metadata.full_name as string,
    };
  };

  export const logout = async () => {
    await getSupabaseClient().auth.signOut();
  };

  export const authenticatedGuard = async (email: string | null) => {
    if (!email)
      throw redirect({
        to: '/sign-in',
      });
  };
}
