import React from 'react';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function RecipeCard({ recipe }) {
  /** Displays a recipe card linking to detail page. */
  const id = recipe?.id ?? recipe?.recipe_id ?? recipe?._id;
  const title = recipe?.title || 'Untitled recipe';
  const image = recipe?.image || recipe?.image_url || 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop';
  const readyInMinutes = recipe?.readyInMinutes || recipe?.ready_in_minutes;
  const servings = recipe?.servings;

  return (
    <div className="card sm-6 lg-4">
      <Link to={`/recipe/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
        <img className="recipe-thumb" src={image} alt={title} loading="lazy" />
        <div className="recipe-body">
          <h3 className="recipe-title">{title}</h3>
          <div className="recipe-meta">
            {readyInMinutes ? `${readyInMinutes} mins · ` : ''}
            {servings ? `${servings} servings` : ''}
          </div>
        </div>
      </Link>
    </div>
  );
}
