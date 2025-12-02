/**
 * Lightweight API client for the Recipe app.
 * Uses fetch with JSON helpers and supports Authorization header via token provider.
 */
const DEFAULT_BASE = 'http://localhost:3001';

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Returns API base from env or default. */
  return process.env.REACT_APP_API_BASE || DEFAULT_BASE;
}

// INTERNAL token accessor set by AuthContext
let tokenGetter = null;

// PUBLIC_INTERFACE
export function setAuthTokenGetter(getterFn) {
  /** Registers a getter function that returns a JWT string or null. */
  tokenGetter = getterFn;
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const url = `${getApiBase()}${path}`;
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
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = (data && data.detail) || (typeof data === 'string' ? data : 'Request failed');
    throw new Error(message || `HTTP ${res.status}`);
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
