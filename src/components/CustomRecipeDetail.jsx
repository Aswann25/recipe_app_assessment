export default function CustomRecipeDetail({ recipe, onClose }) {
  if (!recipe) return null;

  // total time is prep + cook combined
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    // clicking the overlay closes the modal
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="custom-badge">✍️ Your Recipe</div>
        <h2 className="detail-title">{recipe.name}</h2>

        {/* only render each meta item if the value exists */}
        <div className="detail-meta">
          {totalTime > 0     && <span>⏱ {totalTime} min</span>}
          {recipe.servings   && <span>🍽 {recipe.servings} servings</span>}
          {recipe.cuisine    && <span>🌍 {recipe.cuisine}</span>}
          {recipe.difficulty && <span>📊 {recipe.difficulty}</span>}
        </div>

        {/* prep/cook breakdown, shown only if at least one is set */}
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
            // join amount, unit, and name, skipping any empty fields
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