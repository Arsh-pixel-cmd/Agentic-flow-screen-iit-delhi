/* eslint-disable no-unused-vars */
/**
 * AuthAdapter — Interface contract for all auth backends.
 * 
 * Every adapter (Supabase, Local Server, etc.) MUST implement
 * these methods and return data in the exact shapes defined below.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  company: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

export interface SessionResult {
  session: AuthSession | null;
  error: string | null;
}

export interface ProfileResult {
  profile: any | null;
  error: string | null;
}

export interface VoidResult {
  error: string | null;
}

export interface Subscription {
  unsubscribe: () => void;
}

export class AuthAdapter {
  /**
   * Register a new user.
   * @param {{ email: string, password: string, name: string, company?: string }} _data
   * @returns {Promise<AuthResult>}
   */
  async signUp(_data: any): Promise<AuthResult> {
    throw new Error('AuthAdapter.signUp() not implemented');
  }

  /**
   * Sign in an existing user.
   * @param {{ email: string, password: string }} _credentials
   * @returns {Promise<AuthResult>}
   */
  async signIn(_credentials: any): Promise<AuthResult> {
    throw new Error('AuthAdapter.signIn() not implemented');
  }

  /**
   * Sign in with a third-party provider (e.g., 'google').
   * @param {string} _provider
   * @returns {Promise<VoidResult>} (Usually triggers a redirect)
   */
  async signInWithProvider(_provider: any): Promise<VoidResult> {
    throw new Error('AuthAdapter.signInWithProvider() not implemented');
  }

  /**
   * Sign out the current user.
   * @returns {Promise<VoidResult>}
   */
  async signOut(): Promise<VoidResult> {
    throw new Error('AuthAdapter.signOut() not implemented');
  }

  /**
   * Get the current active session (if any).
   * @returns {Promise<SessionResult>}
   */
  async getSession(): Promise<SessionResult> {
    throw new Error('AuthAdapter.getSession() not implemented');
  }

  /**
   * Get the current access token for API calls.
   * @returns {Promise<string|null>}
   */
  async getAccessToken(): Promise<string | null> {
    throw new Error('AuthAdapter.getAccessToken() not implemented');
  }

  /**
   * Fetch extended profile data for a user.
   * @param {string} _userId
   * @returns {Promise<ProfileResult>}
   */
  async getProfile(_userId: any): Promise<ProfileResult> {
    throw new Error('AuthAdapter.getProfile() not implemented');
  }

  /**
   * Update profile data for a user.
   * @param {string} _userId
   * @param {Object} _data
   * @returns {Promise<VoidResult>}
   */
  async updateProfile(_userId: any, _data: any): Promise<VoidResult> {
    throw new Error('AuthAdapter.updateProfile() not implemented');
  }

  /**
   * Listen for auth state changes (login, logout, token refresh).
   * Callback receives (event: string, session: AuthSession|null).
   * @param {Function} _callback
   * @returns {Subscription}
   */
  onAuthStateChange(_callback: any): Subscription {
    throw new Error('AuthAdapter.onAuthStateChange() not implemented');
  }
}
