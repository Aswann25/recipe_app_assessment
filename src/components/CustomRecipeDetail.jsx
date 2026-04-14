export default function CustomRecipeDetail({ recipe, onClose }) {
  if (!recipe) return null;

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="custom-badge">✍️ Your Recipe</div>
        <h2 className="detail-title">{recipe.name}</h2>

        <div className="detail-meta">
          {totalTime > 0    && <span>⏱ {totalTime} min</span>}
          {recipe.servings  && <span>🍽 {recipe.servings} servings</span>}
          {recipe.cuisine   && <span>🌍 {recipe.cuisine}</span>}
          {recipe.difficulty && <span>📊 {recipe.difficulty}</span>}
        </div>

        {(recipe.prepTime || recipe.cookTime) && (
          <div className="time-split">
            {recipe.prepTime && <span>Prep: {recipe.prepTime} min</span>}
            {recipe.cookTime && <span>Cook: {recipe.cookTime} min</span>}
          </div>
        )}

        {recipe.description && (
          <p className="detail-summary">{recipe.description}</p>
        )}

        <h3>Ingredients</h3>
        <ul className="ingredient-list">
          {recipe.ingredients.map((ing) => (
            <li key={ing.id}>
              {[ing.amount, ing.unit, ing.name].filter(Boolean).join(" ")}
            </li>
          ))}
        </ul>

        <h3>Instructions</h3>
        <ol className="instruction-list">
          {recipe.steps.map((step, i) => (
            <li key={step.id}>{step.text}</li>
          ))}
        </ol>

        <p className="created-date">
          Created: {new Date(recipe.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
