import React from 'react';
import RecipeCard from './RecipeCard';

// PUBLIC_INTERFACE
export default function RecipeGrid({ items }) {
  /** Grid of recipe cards. */
  if (!items?.length) {
    return <p className="muted">No recipes found.</p>;
  }
  return (
    <div className="grid">
      {items.map((r) => (
        <RecipeCard key={r.id || r.recipe_id || r._id} recipe={r} />
      ))}
    </div>
  );
}
