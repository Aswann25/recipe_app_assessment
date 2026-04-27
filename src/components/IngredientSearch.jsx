import { useState } from "react";

export default function IngredientSearch({ onSearch, loading }) {
  const [input, setInput] = useState("");  // current text in the input field
  const [tags, setTags] = useState([]);    // confirmed ingredient tags

  // add the current input as a tag, ignoring duplicates
  function addTag() {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setInput("");
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  // pressing Enter or comma confirms the current input as a tag
  function handleKey(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  // block submission if no tags have been added
  function handleSubmit(e) {
    e.preventDefault();
    if (tags.length === 0) return;
    onSearch(tags);
  }

  return (
    <form className="ingredient-search" onSubmit={handleSubmit}>
      <p className="ingredient-hint">
        Enter ingredients you have and find matching recipes.
      </p>

      <div className="ingredient-input-row">
        <input
          className="search-input"
          type="text"
          placeholder="e.g. chicken, garlic, lemon..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="btn btn-secondary" type="button" onClick={addTag}>
          Add
        </button>
        {/* disable search until at least one tag exists */}
        <button className="btn btn-primary" type="submit" disabled={loading || tags.length === 0}>
          {loading ? "Searching..." : "Find Recipes"}
        </button>
      </div>

      {/* tag list — only rendered when there is at least one tag */}
      {tags.length > 0 && (
        <div className="tag-row">
          {tags.map((tag) => (
            <span key={tag} className="ingredient-tag">
              {tag}
              <button
                type="button"
                className="tag-remove"
                onClick={() => removeTag(tag)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </form>
  );
}