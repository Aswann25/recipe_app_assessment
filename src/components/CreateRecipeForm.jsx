import { useState } from "react";
import { nanoid } from "nanoid";

const CUISINES = ["", "Italian", "Mexican", "Chinese", "Indian", "Japanese", "French", "Thai", "Mediterranean", "American", "Other"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function CreateRecipeForm({ onSave, onCancel }) {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine]         = useState("");
  const [difficulty, setDifficulty]   = useState("Easy");
  const [prepTime, setPrepTime]       = useState("");
  const [cookTime, setCookTime]       = useState("");
  const [servings, setServings]       = useState("");

  // each ingredient has an id, amount, unit, and name
  const [ingredients, setIngredients] = useState([
    { id: nanoid(), amount: "", unit: "", name: "" },
  ]);

  // each step has an id and text
  const [steps, setSteps] = useState([{ id: nanoid(), text: "" }]);

  const [error, setError] = useState(null);

  // update one field on a specific ingredient
  function updateIngredient(id, field, value) {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  }
  function addIngredient() {
    setIngredients((prev) => [...prev, { id: nanoid(), amount: "", unit: "", name: "" }]);
  }
  function removeIngredient(id) {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  }

  // update the text of a specific step
  function updateStep(id, value) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, text: value } : s))
    );
  }
  function addStep() {
    setSteps((prev) => [...prev, { id: nanoid(), text: "" }]);
  }
  function removeStep(id) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // validate required fields
    if (!name.trim()) { setError("Recipe name is required."); return; }
    const filledIngredients = ingredients.filter((i) => i.name.trim());
    if (filledIngredients.length === 0) { setError("Add at least one ingredient."); return; }
    const filledSteps = steps.filter((s) => s.text.trim());
    if (filledSteps.length === 0) { setError("Add at least one instruction step."); return; }

    // readyInMinutes is the sum of prep and cook time
    const recipe = {
      id: nanoid(),
      isCustom: true,
      spoonacularId: null,
      name: name.trim(),
      description: description.trim(),
      cuisine,
      difficulty,
      prepTime: prepTime ? parseInt(prepTime) : null,
      cookTime: cookTime ? parseInt(cookTime) : null,
      readyInMinutes: (parseInt(prepTime) || 0) + (parseInt(cookTime) || 0) || null,
      servings: servings ? parseInt(servings) : null,
      ingredients: filledIngredients,
      steps: filledSteps,
      image: "",
      photo: false,
      location: { latitude: "##", longitude: "##", mapURL: "#", smsURL: "#", error: "##" },
      createdAt: new Date().toISOString(),
    };

    onSave(recipe);
  }

  return (
    <div className="create-form-overlay">
      <div className="create-form-box">
        <div className="create-form-header">
          <h2>✍️ Create Your Recipe</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          {/* validation error */}
          {error && <p className="error-text">{error}</p>}

          <section className="form-section">
            <h3>Basic Info</h3>

            <label className="form-label">Recipe Name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Grandma's Tomato Soup"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="A short description of your recipe..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Cuisine</label>
                <select className="form-select" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                  {CUISINES.map((c) => <option key={c} value={c}>{c || "Select..."}</option>)}
                </select>
              </div>
              <div className="form-col">
                <label className="form-label">Difficulty</label>
                <select className="form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Prep Time (min)</label>
                <input className="form-input" type="number" min="0" placeholder="15"
                  value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
              </div>
              <div className="form-col">
                <label className="form-label">Cook Time (min)</label>
                <input className="form-input" type="number" min="0" placeholder="30"
                  value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
              </div>
              <div className="form-col">
                <label className="form-label">Servings</label>
                <input className="form-input" type="number" min="1" placeholder="4"
                  value={servings} onChange={(e) => setServings(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3>Ingredients *</h3>
            {ingredients.map((ing, index) => (
              <div key={ing.id} className="ingredient-row">
                <span className="ing-index">{index + 1}.</span>
                <input
                  className="form-input ing-amount"
                  type="text"
                  placeholder="Amount"
                  value={ing.amount}
                  onChange={(e) => updateIngredient(ing.id, "amount", e.target.value)}
                />
                <input
                  className="form-input ing-unit"
                  type="text"
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(ing.id, "unit", e.target.value)}
                />
                <input
                  className="form-input ing-name"
                  type="text"
                  placeholder="Ingredient name *"
                  value={ing.name}
                  onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                />
                {/* hide remove button when only one ingredient remains */}
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeIngredient(ing.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm add-row-btn" onClick={addIngredient}>
              + Add Ingredient
            </button>
          </section>

          <section className="form-section">
            <h3>Instructions *</h3>
            {steps.map((step, index) => (
              <div key={step.id} className="step-row">
                <span className="step-num">Step {index + 1}</span>
                <textarea
                  className="form-textarea step-textarea"
                  rows={2}
                  placeholder={`Describe step ${index + 1}...`}
                  value={step.text}
                  onChange={(e) => updateStep(step.id, e.target.value)}
                />
                {/* hide remove button when only one step remains */}
                {steps.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeStep(step.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm add-row-btn" onClick={addStep}>
              + Add Step
            </button>
          </section>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              💾 Save Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}