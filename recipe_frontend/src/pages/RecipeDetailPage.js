import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

// PUBLIC_INTERFACE
export default function RecipeDetailPage() {
  /** Detailed view of a recipe with save action. */
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getRecipe(id);
        if (mounted) setRecipe(data);
      } catch (e) {
        setError(e.message || 'Failed to load recipe');
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const onSave = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/recipe/${id}` } });
      return;
    }
    setSaving(true);
    try {
      await api.saveRecipe(id);
      alert('Saved!');
    } catch (e) {
      alert(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <p className="muted">{error}</p>;
  if (!recipe) return <p>Loading...</p>;

  const title = recipe.title || 'Recipe';
  const image = recipe.image || recipe.image_url;
  const summary = recipe.summary || recipe.description;

  return (
    <div>
      <button className="btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="spacer"></div>
      <div className="card">
        {image && <img className="recipe-thumb" style={{ height: 280 }} src={image} alt={title} />}
        <div className="recipe-body">
          <h1 className="h1">{title}</h1>
          <div className="spacer"></div>
          <button className="btn primary" disabled={saving} onClick={onSave}>
            {saving ? 'Saving...' : 'Save recipe'}
          </button>
          <div className="spacer"></div>
          <div className="muted" dangerouslySetInnerHTML={{ __html: summary || '' }} />
        </div>
      </div>
    </div>
  );
}
