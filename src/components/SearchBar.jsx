import { useState } from "react";

const CUISINES = ["", "Italian", "Mexican", "Chinese", "Indian", "Japanese", "French", "Thai", "Mediterranean"];
const DIETS = ["", "vegetarian", "vegan", "gluten free", "ketogenic", "paleo", "dairy free"];

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [diet, setDiet] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch({ query: query.trim(), cuisine, diet });
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-row">
        <input
          className="search-input"
          type="text"
          placeholder="Search recipes e.g. pasta, chicken soup..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      <div className="filter-row">
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          <option value="">All cuisines</option>
          {CUISINES.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={diet} onChange={(e) => setDiet(e.target.value)}>
          <option value="">Any diet</option>
          {DIETS.filter(Boolean).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
    </form>
  );
}
