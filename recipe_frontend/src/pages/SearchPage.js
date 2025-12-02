import React, { useEffect, useMemo, useState } from 'react';
import { SearchBar, RecipeGrid } from '../components';
import { api, getApiBase, healthCheck } from '../api/client';

// PUBLIC_INTERFACE
export default function SearchPage() {
  /** Search recipes and display a grid. */
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [health, setHealth] = useState({ checked: false, ok: false, status: 0, urlTried: '' });
  const apiBase = useMemo(() => getApiBase(), []);

  // PUBLIC_INTERFACE
  const doSearch = async () => {
    /** Triggers search against backend and updates results state. */
    setLoading(true);
    setError('');
    try {
      const data = await api.search(q);
      setItems(Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []));
    } catch (e) {
      const msg = e?.message || 'Search failed';
      const lower = msg.toLowerCase();
      const hint = lower.includes('network')
        ? ` — Network error. Check backend at ${apiBase} and make sure CORS allows http://localhost:3000`
        : lower.includes('cors')
          ? ' — CORS blocked. Configure backend CORS to allow http://localhost:3000'
          : '';
      setError(`${msg}${hint}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check backend health once on mount to quickly diagnose URL/CORS issues
    (async () => {
      try {
        const res = await healthCheck();
        setHealth({ checked: true, ok: !!res.ok, status: res.status || 0, urlTried: res.url || '' });
      } catch {
        setHealth({ checked: true, ok: false, status: 0, urlTried: `${apiBase}/health` });
      }
    })();
  }, [apiBase]);

  useEffect(() => {
    // initial load: show popular results with empty query
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const HealthInfo = () => (
    <p className="muted" style={{ fontSize: 12 }}>
      API base: {apiBase}
      {health.checked
        ? ` · Health: ${health.ok ? 'OK' : 'unreachable'} (${health.status}) at ${health.urlTried}`
        : ' · Health: checking...'}
    </p>
  );

  return (
    <div>
      <h1 className="h1">Discover recipes</h1>
      <p className="muted">Explore and save your favorite meals.</p>
      <div className="spacer"></div>
      <SearchBar value={q} onChange={setQ} onSubmit={doSearch} />
      <div className="spacer"></div>
      {loading ? <p>Loading...</p> : error ? <p className="muted">{error}</p> : <RecipeGrid items={items} />}
      <div className="spacer"></div>
      <HealthInfo />
    </div>
  );
}
