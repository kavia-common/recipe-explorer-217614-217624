import React, { useEffect, useState } from 'react';
import RecipeGrid from '../components/RecipeGrid';
import { api } from '../api/client';

// PUBLIC_INTERFACE
export default function SavedPage() {
  /** Shows user's saved recipes (requires auth). */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await api.getSaved();
        if (mounted) setItems(Array.isArray(data) ? data : data?.results || []);
      } catch (e) {
        setErr(e.message || 'Failed to load saved recipes');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (err) return <p className="muted">{err}</p>;

  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <div>
      <h1 className="h1">Saved recipes</h1>
      <div className="spacer"></div>
      {hasItems ? (
        <RecipeGrid items={items} />
      ) : (
        <div className="card" style={{ padding: 16 }}>
          <p className="muted">You have no saved recipes yet.</p>
          <div className="spacer"></div>
          <a className="btn primary" href="/">
            Find recipes to save
          </a>
        </div>
      )}
    </div>
  );
}
