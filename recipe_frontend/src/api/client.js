/**
 * Lightweight API client for the Recipe app.
 * Uses fetch with JSON helpers and supports Authorization header via token provider.
 *
 * Integration notes:
 * - Frontend reads REACT_APP_API_BASE (default http://localhost:3001) for backend base URL.
 * - Backend should allow CORS from http://localhost:3000 via CORS_ALLOWED_ORIGINS.
 */
const DEFAULT_BASE = 'http://localhost:3001';

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Returns API base from env or default. */
  return (process && process.env && process.env.REACT_APP_API_BASE) || DEFAULT_BASE;
}

// INTERNAL token accessor set by AuthContext
let tokenGetter = null;

// PUBLIC_INTERFACE
export function setAuthTokenGetter(getterFn) {
  /** Registers a getter function that returns a JWT string or null. */
  tokenGetter = getterFn;
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const base = getApiBase().replace(/\/+$/, '');
  const urlPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${urlPath}`;

  const token = tokenGetter ? tokenGetter() : null;
  const reqHeaders = {
    'Content-Type': 'application/json',
    ...(headers || {}),
  };
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'omit',
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (data && data.detail) ||
      (typeof data === 'string' ? data : null) ||
      (isJson && data && (data.error || data.message)) ||
      `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

// PUBLIC_INTERFACE
export const api = {
  /** Search recipes by query string. */
  search: (q) => request(`/recipes/search?q=${encodeURIComponent(q || '')}`),
  /** Get recipe by ID. */
  getRecipe: (id) => request(`/recipes/${id}`),
  /** Get saved recipes for current user (requires auth). */
  getSaved: () => request(`/users/me/saved`),
  /** Save/unsave a recipe (requires auth). */
  saveRecipe: (recipeId) => request(`/users/me/saved`, { method: 'POST', body: { recipe_id: recipeId } }),
  unsaveRecipe: (recipeId) => request(`/users/me/saved/${encodeURIComponent(recipeId)}`, { method: 'DELETE' }),
  /** Auth endpoints */
  login: (email, password) => request(`/auth/login`, { method: 'POST', body: { email, password } }),
  signup: (email, password) => request(`/auth/signup`, { method: 'POST', body: { email, password } }),
};
