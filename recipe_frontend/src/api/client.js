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
     const injected = String(window.__REACT_APP__.API_BASE);
     if (injected) return injected;
   }
   // 2) CRA-style compile-time replacement: process.env.REACT_APP_API_BASE
   // Accessing process.env here is transformed at build time by CRA.
   try {
     if (typeof process !== 'undefined' && process && process.env && process.env.REACT_APP_API_BASE) {
       const envBase = String(process.env.REACT_APP_API_BASE);
       if (envBase) return envBase;
     }
   } catch {
     // ignore any runtime issues
   }
   // 3) Fallback to DEFAULT_BASE
   return DEFAULT_BASE;
 }
 
 function normalizeBaseUrl(base) {
   // Ensure no trailing slash
   return String(base || '').replace(/\/+$/, '');
 }
 
 function classifyNetworkError(errMessage) {
   const msg = (errMessage || '').toLowerCase();
   if (msg.includes('failed to fetch') || msg.includes('networkerror')) {
     return 'network';
   }
   if (msg.includes('cors') || msg.includes('blocked by')) {
     return 'cors';
   }
   return 'unknown';
 }
 
 // INTERNAL token accessor set by AuthContext
 let tokenGetter = null;
 
 // PUBLIC_INTERFACE
 export function setAuthTokenGetter(getterFn) {
   /** Registers a getter function that returns a JWT string or null. */
   tokenGetter = getterFn;
 }
 
 /**
  * Health check helper to quickly verify connectivity and CORS to backend.
  * Attempts GET /health and falls back to GET /.
  */
 // PUBLIC_INTERFACE
 export async function healthCheck() {
   const base = normalizeBaseUrl(getApiBase());
   const urlsToTry = [`${base}/health`, `${base}/`];
   for (const url of urlsToTry) {
     try {
       const res = await fetch(url, { method: 'GET', credentials: 'omit' });
       const ct = res.headers.get('content-type') || '';
       let body = null;
       try {
         body = ct.includes('application/json') ? await res.json() : await res.text();
       } catch {
         body = null;
       }
       return { ok: res.ok, status: res.status, url, body };
     } catch (e) {
       // continue trying next URL
     }
   }
   return { ok: false, status: 0, url: urlsToTry[0], body: null };
 }
 
 /**
  * Internal request helper for JSON APIs.
  * Adds Authorization only for non-public endpoints to avoid accidental 401 on public search.
  */
 async function request(path, { method = 'GET', body, headers } = {}) {
   const baseRaw = getApiBase();
   const base = normalizeBaseUrl(baseRaw);
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
     });
   } catch (networkErr) {
     const classification = classifyNetworkError(networkErr?.message || '');
     const baseHint = `Backend base resolved to ${base}.`;
     let hint =
       `${baseHint} Ensure backend is listening on 0.0.0.0:3001 and CORS allows http://localhost:3000.`;
     if (classification === 'network') {
       hint = `${baseHint} Network error. Backend may be down or URL is wrong (REACT_APP_API_BASE).`;
     } else if (classification === 'cors') {
       hint = `${baseHint} CORS blocked. Configure server CORS to allow http://localhost:3000.`;
     }
     const msg = networkErr?.message ? `${networkErr.message} — ${hint}` : hint;
     // eslint-disable-next-line no-console
     console.warn('[api] fetch failed', { url, message: networkErr?.message, base });
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
   /** This is a public function. Search recipes by query string. Public endpoint, no auth required. */
   search: (q) => request(`/recipes/search?q=${encodeURIComponent(q || '')}`),
   /** This is a public function. Get recipe by ID. Public endpoint, no auth required. */
   getRecipe: (id) => request(`/recipes/${id}`),
   /** This is a public function. Get saved recipes for current user (requires auth). */
   getSaved: () => request(`/users/me/saved`),
   /** This is a public function. Save a recipe (requires auth). */
   saveRecipe: (recipeId) => request(`/users/me/saved`, { method: 'POST', body: { recipe_id: recipeId } }),
   /** This is a public function. Unsave a recipe (requires auth). */
   unsaveRecipe: (recipeId) => request(`/users/me/saved/${encodeURIComponent(recipeId)}`, { method: 'DELETE' }),
   /** This is a public function. Auth endpoints */
   login: (email, password) => request(`/auth/login`, { method: 'POST', body: { email, password } }),
   /** This is a public function. Sign up endpoint */
   signup: (email, password) => request(`/auth/signup`, { method: 'POST', body: { email, password } }),
 };
