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
import PermissionsGate    from "./components/PermissionsGate.jsx";

const STORAGE_KEY = "recipe-finder-saved";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// Removed "Located" filter — location is no longer stored on recipes
const FILTER_MAP = {
  All:          () => true,
  Photographed: (r) => r.photo === true,
  "My Recipes": (r) => r.isCustom === true,
};
const FILTER_NAMES = Object.keys(FILTER_MAP);

export default function App() {
  const [tab, setTab] = useState("search");

  const [results, setResults]   = useState([]);
  const [random, setRandom]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [searched, setSearched] = useState(false);

  const [savedRecipes, setSavedRecipes] = useState(loadSaved);
  const [filter, setFilter]             = useState("All");

  const [detailId, setDetailId]         = useState(null);
  const [customDetail, setCustomDetail] = useState(null);
  const [showCreate, setShowCreate]     = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    setLoading(true);
    getRandomRecipes(9)
      .then(setRandom)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // CREATE (Spoonacular recipe) — no geolocation
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

  // CREATE (user-made recipe) — no geolocation
  function saveCustomRecipe(recipe) {
    // Strip location fields if CreateRecipeForm still sets them
    const { location, ...rest } = recipe;
    setSavedRecipes((prev) => [rest, ...prev]);
    setShowCreate(false);
    setTab("saved");
  }

  // UPDATE name
  function editRecipe(id, newName) {
    setSavedRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: newName } : r))
    );
  }

  // DELETE
  function deleteRecipe(id) {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  function photoedTask(id) {
    setSavedRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, photo: true } : r))
    );
  }

  async function handleKeywordSearch(params) {
    setLoading(true); setError(null); setResults([]); setSearched(true);
    try {
      const data = await searchRecipes(params);
      setResults(data);
      if (data.length === 0) setError("No recipes found — try different keywords.");
    } catch (e) { setError(`Search failed: ${e.message}. Check your API key.`); }
    finally { setLoading(false); }
  }

  async function handleIngredientSearch(ingredients) {
    setLoading(true); setError(null); setResults([]); setSearched(true);
    try {
      const data = await searchByIngredients(ingredients, 12);
      setResults(data);
      if (data.length === 0) setError("No recipes found for those ingredients.");
    } catch (e) { setError(`Search failed: ${e.message}. Check your API key.`); }
    finally { setLoading(false); }
  }

  const savedIds      = new Set(savedRecipes.map((r) => r.spoonacularId).filter(Boolean));
  const displayList   = results.length > 0 ? results : random;
  const filteredSaved = savedRecipes.filter(FILTER_MAP[filter]);
  const savedCount    = savedRecipes.length;

  return (
    <PermissionsGate>
      <div className="app">
        <header className="app-header">
          <h1>🍳 Recipe Finder</h1>
          <nav className="tab-nav">
            <button className={`tab-btn ${tab==="search"?"active":""}`}       onClick={() => setTab("search")}>🔍 Search</button>
            <button className={`tab-btn ${tab==="ingredients"?"active":""}`}  onClick={() => setTab("ingredients")}>🥦 Ingredients</button>
            <button className={`tab-btn ${tab==="create"?"active":""}`}       onClick={() => setTab("create")}>✍️ Create</button>
            <button className={`tab-btn ${tab==="saved"?"active":""}`}        onClick={() => setTab("saved")}>❤️ Saved ({savedCount})</button>
            <button className={`tab-btn ${tab==="supermarkets"?"active":""}`} onClick={() => setTab("supermarkets")}>🛒 Stores</button>
          </nav>
        </header>

        {tab === "search" && (
          <main className="search-tab">
            <SearchBar onSearch={handleKeywordSearch} loading={loading} />
            {error   && <p className="error-text">{error}</p>}
            {loading && <p className="loading-text">Loading recipes...</p>}
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

        {tab === "supermarkets" && <Supermarkets />}

        {detailId && (
          <RecipeDetail
            recipeId={detailId}
            onClose={() => setDetailId(null)}
            onSave={(recipe) => { saveRecipe(recipe); setDetailId(null); setTab("saved"); }}
            saved={savedIds.has(detailId)}
          />
        )}

        {customDetail && (
          <CustomRecipeDetail
            recipe={customDetail}
            onClose={() => setCustomDetail(null)}
          />
        )}

        {showCreate && (
          <CreateRecipeForm
            onSave={saveCustomRecipe}
            onCancel={() => setShowCreate(false)}
          />
        )}
      </div>
    </PermissionsGate>
  );
}