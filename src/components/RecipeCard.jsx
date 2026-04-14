export default function RecipeCard({ recipe, onSave, saved }) {
  return (
    <div className="recipe-card">
      <img
        className="recipe-card-img"
        src={recipe.image || "https://via.placeholder.com/312x231?text=No+Image"}
        alt={recipe.title}
        loading="lazy"
      />
      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <div className="recipe-card-meta">
          {recipe.readyInMinutes && (
            <span>⏱ {recipe.readyInMinutes} min</span>
          )}
          {recipe.servings && (
            <span>🍽 {recipe.servings} servings</span>
          )}
        </div>
        <button
          className={`btn ${saved ? "btn-saved" : "btn-primary"}`}
          onClick={() => onSave(recipe)}
          disabled={saved}
        >
          {saved ? "✓ Saved" : "Save Recipe"}
        </button>
      </div>
    </div>
  );
}
