/**
 * AuthContext: manages JWT token, provides login/logout/signup helpers,
 * and exposes a token getter to the API client.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthTokenGetter } from '../api/client';

const STORAGE_KEY = 'recipeapp_auth_v1';

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides auth state and actions to descendants. */
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          setToken(parsed.token);
          setUser(parsed.user || null);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    } catch {
      // ignore
    }
  }, [token, user]);

  // Provide token to api client
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    // Expecting data: { access_token, user }
    setToken(data?.access_token || null);
    setUser(data?.user || null);
    return data;
  }, []);

  const signup = useCallback(async (email, password) => {
    const data = await api.signup(email, password);
    // Optionally auto-login if backend returns token
    if (data?.access_token) {
      setToken(data.access_token);
      setUser(data?.user || null);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      login,
      signup,
      logout,
    }),
    [token, user, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth state and actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
