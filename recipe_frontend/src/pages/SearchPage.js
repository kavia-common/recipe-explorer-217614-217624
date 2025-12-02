import React, { useEffect, useState } from 'react';
import { SearchBar, RecipeGrid } from '../components';
import { api } from '../api/client';

// PUBLIC_INTERFACE
export default function SearchPage() {
  /** Search recipes and display a grid. */
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const doSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.search(q);
      setItems(Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []));
    } catch (e) {
      setError(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load: show popular results with empty query
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="h1">Discover recipes</h1>
      <p className="muted">Explore and save your favorite meals.</p>
      <div className="spacer"></div>
      <SearchBar value={q} onChange={setQ} onSubmit={doSearch} />
      <div className="spacer"></div>
      {loading ? <p>Loading...</p> : error ? <p className="muted">{error}</p> : <RecipeGrid items={items} />}
    </div>
  );
}
