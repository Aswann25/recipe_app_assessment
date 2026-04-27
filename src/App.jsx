import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { searchRecipes, getRandomRecipes, searchByIngredients } from "./api.js";
import SearchBar          from "./components/SearchBar.jsx";
import IngredientSearch   from "./components/IngredientSearch.jsx";
import RecipeCard         from "./components/RecipeCard.jsx";
import RecipeDetail       from "./components/RecipeDetail.jsx";
import SavedRecipeItem    from "./components/SavedRecipeItem.jsx";
import FilterButton       from "./components/FilterButton.jsx";
import CreateRecipeForm   from "./components/CreateRecipeForm.jsx";
import CustomRecipeDetail from "./components/CustomRecipeDetail.jsx";
import Supermarkets       from "./components/Supermarkets.jsx";

const STORAGE_KEY = "recipe-finder-saved"; // localStorage key for persisting saved recipes

// Load saved recipes from localStorage, returning an empty array if nothing is stored or parsing fails
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// Filter definitions for the Saved tab — each value is a predicate function
const FILTER_MAP = {
  All:          () => true,
  Photographed: (r) => r.photo === true,
  "My Recipes": (r) => r.isCustom === true,
};
const FILTER_NAMES = Object.keys(FILTER_MAP);

export default function App() {
  const [tab, setTab] = useState("search"); // active navigation tab

  // Search results and UI state
  const [results, setResults]   = useState([]);
  const [random, setRandom]     = useState([]);   // fallback trending recipes
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [searched, setSearched] = useState(false); // true once the user has run a search

  // Saved recipes list and the active filter
  const [savedRecipes, setSavedRecipes] = useState(loadSaved);
  const [filter, setFilter]             = useState("All");

  // Detail / modal state
  const [detailId, setDetailId]         = useState(null); // ID of the Spoonacular recipe to show in detail modal
  const [customDetail, setCustomDetail] = useState(null); // custom recipe object to show in detail modal
  const [showCreate, setShowCreate]     = useState(false); // whether the create-recipe form is open

  // Persist saved recipes to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  // Fetch random/trending recipes on first load
  useEffect(() => {
    setLoading(true);
    getRandomRecipes(9)
      .then(setRandom)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Save a Spoonacular recipe, skipping it if already saved
  function saveRecipe(recipe) {
    if (savedRecipes.some((r) => r.spoonacularId === recipe.id)) return;
    const newItem = {
      id: nanoid(),
      spoonacularId: recipe.id,
      name: recipe.title,
      image: recipe.image || "",
      isCustom: false,
      photo: false,
    };
    setSavedRecipes((prev) => [newItem, ...prev]);
  }

  // Save a user-created recipe, strip the temporary location field, then switch to Saved tab
  function saveCustomRecipe(recipe) {
    const { location, ...rest } = recipe;
    setSavedRecipes((prev) => [rest, ...prev]);
    setShowCreate(false);
    setTab("saved");
  }

  // Rename a saved recipe by ID
  function editRecipe(id, newName) {
    setSavedRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: newName } : r))
    );
  }

  // Remove a saved recipe by ID
  function deleteRecipe(id) {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  // Mark a saved recipe as photographed
  function photoedTask(id) {
    setSavedRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, photo: true } : r))
    );
  }

  // Run a keyword search and update results
  async function handleKeywordSearch(params) {
    setLoading(true); setError(null); setResults([]); setSearched(true);
    try {
      const data = await searchRecipes(params);
      setResults(data);
      if (data.length === 0) setError("No recipes found — try different keywords.");
    } catch (e) { setError(`Search failed: ${e.message}. Check your API key.`); }
    finally { setLoading(false); }
  }

  // Run an ingredient-based search and update results
  async function handleIngredientSearch(ingredients) {
    setLoading(true); setError(null); setResults([]); setSearched(true);
    try {
      const data = await searchByIngredients(ingredients, 12);
      setResults(data);
      if (data.length === 0) setError("No recipes found for those ingredients.");
    } catch (e) { setError(`Search failed: ${e.message}. Check your API key.`); }
    finally { setLoading(false); }
  }

  // IDs of already-saved Spoonacular recipes (for highlighting saved state on cards)
  const savedIds      = new Set(savedRecipes.map((r) => r.spoonacularId).filter(Boolean));
  // Show search results if available, otherwise fall back to random/trending
  const displayList   = results.length > 0 ? results : random;
  // Apply the active filter to the saved list
  const filteredSaved = savedRecipes.filter(FILTER_MAP[filter]);
  const savedCount    = savedRecipes.length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍳 Recipe Finder</h1>
        {/* Main navigation tabs */}
        <nav className="tab-nav">
          <button className={`tab-btn ${tab==="search"?"active":""}`}       onClick={() => setTab("search")}>🔍 Search</button>
          <button className={`tab-btn ${tab==="ingredients"?"active":""}`}  onClick={() => setTab("ingredients")}>🥦 Ingredients</button>
          <button className={`tab-btn ${tab==="create"?"active":""}`}       onClick={() => setTab("create")}>✍️ Create</button>
          <button className={`tab-btn ${tab==="saved"?"active":""}`}        onClick={() => setTab("saved")}>❤️ Saved ({savedCount})</button>
          <button className={`tab-btn ${tab==="supermarkets"?"active":""}`} onClick={() => setTab("supermarkets")}>🛒 Stores</button>
        </nav>
      </header>

      {/* Search tab — keyword search with trending fallback */}
      {tab === "search" && (
        <main className="search-tab">
          <SearchBar onSearch={handleKeywordSearch} loading={loading} />
          {error   && <p className="error-text">{error}</p>}
          {loading && <p className="loading-text">Loading recipes...</p>}
          {/* Only show the "Trending" label before the user has searched */}
          {!loading && !searched && <p className="section-label">✨ Trending recipes</p>}
          <div className="recipe-grid">
            {displayList.map((recipe) => (
              <div key={recipe.id} className="recipe-card-wrapper" onClick={() => setDetailId(recipe.id)}>
                <RecipeCard
                  recipe={recipe}
                  onSave={(e) => { e.stopPropagation(); saveRecipe(recipe); }}
                  saved={savedIds.has(recipe.id)}
                />
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Ingredients tab — search by what's in the fridge */}
      {tab === "ingredients" && (
        <main className="search-tab">
          <IngredientSearch onSearch={handleIngredientSearch} loading={loading} />
          {error   && <p className="error-text">{error}</p>}
          {loading && <p className="loading-text">Finding recipes with your ingredients...</p>}
          {results.length > 0 && (
            <p className="section-label">Found {results.length} recipe{results.length!==1?"s":""}</p>
          )}
          <div className="recipe-grid">
            {results.map((recipe) => (
              <div key={recipe.id} className="recipe-card-wrapper" onClick={() => setDetailId(recipe.id)}>
                <RecipeCard
                  recipe={recipe}
                  onSave={(e) => { e.stopPropagation(); saveRecipe(recipe); }}
                  saved={savedIds.has(recipe.id)}
                />
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Create tab — write and manage custom recipes */}
      {tab === "create" && (
        <main className="create-tab">
          <div className="create-tab-intro">
            <h2>✍️ Create Your Own Recipe</h2>
            <p className="muted-text">
              Write, save, and photograph your own recipes. They'll appear in My Recipes alongside ones you find.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowCreate(true)}>
              + New Recipe
            </button>
          </div>

          {/* List existing custom recipes if any have been created */}
          {savedRecipes.filter((r) => r.isCustom).length > 0 && (
            <>
              <p className="section-label" style={{ marginTop: "1.5rem" }}>
                Your recipes ({savedRecipes.filter((r) => r.isCustom).length})
              </p>
              <ul className="saved-list">
                {savedRecipes.filter((r) => r.isCustom).map((item) => (
                  <SavedRecipeItem
                    key={item.id}
                    item={item}
                    onDelete={deleteRecipe}
                    onEdit={editRecipe}
                    onViewDetail={setDetailId}
                    onViewCustom={setCustomDetail}
                    photoedTask={photoedTask}
                  />
                ))}
              </ul>
            </>
          )}
        </main>
      )}

      {/* Saved tab — all saved recipes with filter controls */}
      {tab === "saved" && (
        <main className="saved-tab">
          <div className="saved-header">
            <h2>My Saved Recipes</h2>
            <div className="filter-bar">
              {FILTER_NAMES.map((name) => (
                <FilterButton key={name} name={name} isPressed={name===filter} setFilter={setFilter} />
              ))}
            </div>
          </div>

          {/* Empty states for no saved recipes or no filter matches */}
          {savedRecipes.length === 0 ? (
            <p className="muted-text">No saved recipes yet.</p>
          ) : filteredSaved.length === 0 ? (
            <p className="muted-text">No recipes match "{filter}".</p>
          ) : (
            <ul className="saved-list">
              {filteredSaved.map((item) => (
                <SavedRecipeItem
                  key={item.id}
                  item={item}
                  onDelete={deleteRecipe}
                  onEdit={editRecipe}
                  onViewDetail={setDetailId}
                  onViewCustom={setCustomDetail}
                  photoedTask={photoedTask}
                />
              ))}
            </ul>
          )}
        </main>
      )}

      {/* Stores tab — nearby supermarket finder */}
      {tab === "supermarkets" && <Supermarkets />}

      {/* Recipe detail modal for Spoonacular recipes */}
      {detailId && (
        <RecipeDetail
          recipeId={detailId}
          onClose={() => setDetailId(null)}
          onSave={(recipe) => { saveRecipe(recipe); setDetailId(null); setTab("saved"); }}
          saved={savedIds.has(detailId)}
        />
      )}

      {/* Detail modal for user-created recipes */}
      {customDetail && (
        <CustomRecipeDetail
          recipe={customDetail}
          onClose={() => setCustomDetail(null)}
        />
      )}

      {/* Create recipe form modal */}
      {showCreate && (
        <CreateRecipeForm
          onSave={saveCustomRecipe}
          onCancel={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}