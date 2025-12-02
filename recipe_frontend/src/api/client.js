 /**
  * Lightweight API client for the Recipe app.
  * Uses fetch with JSON helpers and supports Authorization header via token provider.
  *
  * Integration notes:
  * - Frontend reads REACT_APP_API_BASE (default http://localhost:3001) for backend base URL.
  * - Backend should allow CORS from http://localhost:3000 via CORS_ALLOWED_ORIGINS.
  */
 const DEFAULT_BASE = 'http://localhost:3001';
 
 /**
  * Resolve API base URL safely in the browser. CRA replaces process.env.* at build time,
  * so referencing process.env here is fine at build but we avoid accessing global process at runtime.
  */
 // PUBLIC_INTERFACE
 export function getApiBase() {
   /** Returns API base from env or default without referencing global process at runtime. */
   // 1) Prefer window.__REACT_APP__.API_BASE if the host page injected one
   if (typeof window !== 'undefined' && window.__REACT_APP__ && window.__REACT_APP__.API_BASE) {
     return String(window.__REACT_APP__.API_BASE);
   }
   // 2) CRA-style compile-time replacement: process.env.REACT_APP_API_BASE
   // Accessing process.env here is transformed at build time by CRA.
   try {
     if (typeof process !== 'undefined' && process && process.env && process.env.REACT_APP_API_BASE) {
       return String(process.env.REACT_APP_API_BASE);
     }
   } catch {
     // ignore any runtime issues
   }
   // 3) Fallback to DEFAULT_BASE
   return DEFAULT_BASE;
 }
 
 // INTERNAL token accessor set by AuthContext
 let tokenGetter = null;
 
 // PUBLIC_INTERFACE
 export function setAuthTokenGetter(getterFn) {
   /** Registers a getter function that returns a JWT string or null. */
   tokenGetter = getterFn;
 }
 
 /**
  * Internal request helper for JSON APIs.
  * Adds Authorization only for non-public endpoints to avoid accidental 401 on public search.
  */
 async function request(path, { method = 'GET', body, headers } = {}) {
   const base = getApiBase().replace(/\/+$/, '');
   const urlPath = path.startsWith('/') ? path : `/${path}`;
   const url = `${base}${urlPath}`;
 
   const token = tokenGetter ? tokenGetter() : null;
   const reqHeaders = {
     'Content-Type': 'application/json',
     ...(headers || {}),
   };
 
   // Do not attach Authorization for public endpoints such as /recipes/search and /recipes/:id
   const isPublicEndpoint =
     urlPath.startsWith('/recipes/search') || /^\/recipes\/[^/]+$/.test(urlPath);
 
   if (token && !isPublicEndpoint) {
     reqHeaders['Authorization'] = `Bearer ${token}`;
   }
 
   let res;
   try {
     res = await fetch(url, {
       method,
       headers: reqHeaders,
       body: body ? JSON.stringify(body) : undefined,
       credentials: 'omit',
       // mode left default so same-origin policy works in dev; if backend is on different origin,
       // CORS must allow http://localhost:3000 in backend config.
     });
   } catch (networkErr) {
     // Surface more actionable network/CORS error info
     const hint =
       'Network error. Possible causes: backend not running at ' +
       `${base}, wrong REACT_APP_API_BASE, or CORS blocked (allow http://localhost:3000).`;
     const msg =
       (networkErr && networkErr.message) ? `${networkErr.message} — ${hint}` : hint;
     throw new Error(msg);
   }
 
   const contentType = res.headers.get('content-type') || '';
   const isJson = contentType.includes('application/json');
 
   let data;
   try {
     data = isJson ? await res.json() : await res.text();
   } catch {
     data = null;
   }
 
   if (!res.ok) {
     // If CORS blocks, browser often reports TypeError before reaching here; but if backend returns JSON error,
     // show details to the user.
     const message =
       (data && data.detail) ||
       (isJson && data && (data.error || data.message)) ||
       (typeof data === 'string' && data) ||
       `HTTP ${res.status}`;
     throw new Error(message);
   }
   return data;
 }
 
 // PUBLIC_INTERFACE
 export const api = {
   /** Search recipes by query string. Public endpoint, no auth required. */
   search: (q) => request(`/recipes/search?q=${encodeURIComponent(q || '')}`),
   /** Get recipe by ID. Public endpoint, no auth required. */
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
