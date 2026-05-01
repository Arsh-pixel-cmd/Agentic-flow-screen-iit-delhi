import { AuthAdapter } from './AuthAdapter';
import { supabase } from '../supabaseClient';

/**
 * Normalizes a Supabase user object into the standard AuthUser shape.
 * This is the SINGLE place where Supabase-specific field names get mapped.
 */
function normalizeUser(supabaseUser: any) {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
    company: supabaseUser.user_metadata?.company || null,
    avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
    createdAt: supabaseUser.created_at || null,
  };
}

/**
 * Normalizes a Supabase error into a plain string.
 */
function normalizeError(error: any) {
  if (!error) return null;
  return error.message || String(error);
}

export class SupabaseAuthAdapter extends AuthAdapter {

  async signUp({ email, password, name, company }: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          company: company || '',
        },
      },
    });

    return {
      user: normalizeUser(data?.user),
      error: normalizeError(error),
    };
  }

  async signIn({ email, password }: any) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: normalizeUser(data?.user),
      error: normalizeError(error),
    };
  }

  async signInWithProvider(provider: any) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    return { error: normalizeError(error) };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error: normalizeError(error) };
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session) {
      return { session: null, error: normalizeError(error) };
    }
    return {
      session: {
        user: normalizeUser(session.user) as any,
        accessToken: session.access_token,
      },
      error: null,
    };
  }

  async getAccessToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async getProfile(userId: any) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { profile: null, error: normalizeError(error) };
    }

    return {
      profile: {
        id: data.id,
        name: data.full_name || data.name || 'User',
        email: data.email || null,
        company: data.company || null,
        avatarUrl: data.avatar_url || null,
        createdAt: data.created_at || null,
      },
      error: null,
    };
  }

  async updateProfile(userId: any, profileData: any) {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...profileData, updated_at: new Date().toISOString() });

    return { error: normalizeError(error) };
  }

  onAuthStateChange(callback: any) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: any, session: any) => {
        callback(event, session ? {
          user: normalizeUser(session.user),
          accessToken: session.access_token,
        } : null);
      }
    );

    return { unsubscribe: () => subscription.unsubscribe() };
  }
}
