import { useEffect, useState } from "react";
import { getRecipeDetail } from "../api.js";

export default function RecipeDetail({ recipeId, onClose, onSave, saved }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch full recipe details whenever the selected recipeId changes
  useEffect(() => {
    if (!recipeId) return;
    setLoading(true);
    setError(null);
    getRecipeDetail(recipeId)
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [recipeId]);

  return (
    // clicking the overlay closes the modal
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {loading && <p className="loading-text">Loading recipe...</p>}
        {error && <p className="error-text">Error: {error}</p>}

        {detail && (
          <>
            <img className="detail-img" src={detail.image} alt={detail.title} />
            <h2 className="detail-title">{detail.title}</h2>

            {/* only render each meta item if the value exists */}
            <div className="detail-meta">
              {detail.readyInMinutes && <span>⏱ {detail.readyInMinutes} min</span>}
              {detail.servings && <span>🍽 {detail.servings} servings</span>}
              {detail.cuisines?.length > 0 && <span>🌍 {detail.cuisines.join(", ")}</span>}
              {detail.diets?.length > 0 && <span>🥗 {detail.diets.join(", ")}</span>}
            </div>

            {/* strip anchor tags from the API-provided HTML summary */}
            {detail.summary && (
              <div
                className="detail-summary"
                dangerouslySetInnerHTML={{
                  __html: detail.summary.replace(/<a[^>]*>|<\/a>/g, ""),
                }}
              />
            )}

            <h3>Ingredients</h3>
            <ul className="ingredient-list">
              {detail.extendedIngredients?.map((ing) => (
                <li key={ing.id}>{ing.original}</li>
              ))}
            </ul>

            {/* only render instructions if the API returned at least one step */}
            {detail.analyzedInstructions?.[0]?.steps?.length > 0 && (
              <>
                <h3>Instructions</h3>
                <ol className="instruction-list">
                  {detail.analyzedInstructions[0].steps.map((step) => (
                    <li key={step.number}>{step.step}</li>
                  ))}
                </ol>
              </>
            )}

            {/* button is disabled and styled differently once saved */}
            <button
              className={`btn ${saved ? "btn-saved" : "btn-primary"}`}
              onClick={() => onSave(detail)}
              disabled={saved}
            >
              {saved ? "✓ Already Saved" : "Save to My Recipes"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}