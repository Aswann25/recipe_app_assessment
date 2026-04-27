const API_KEY = "afb3440c473641b09be8ce264d99248a";
const BASE = "https://api.spoonacular.com";

// Search recipes by keyword, with optional cuisine and diet filters
export async function searchRecipes({ query, cuisine = "", diet = "", number = 12 }) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    query,
    cuisine,
    diet,
    number,
    addRecipeInformation: true, // include full recipe info in results
    fillIngredients: false,
  });
  const res = await fetch(`${BASE}/recipes/complexSearch?${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  const data = await res.json();
  return data.results; // array of matching recipes
}

// Fetch full details for a single recipe by ID
export async function getRecipeDetail(id) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    includeNutrition: false, // skip nutrition data to keep response lean
  });
  const res = await fetch(`${BASE}/recipes/${id}/information?${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  return res.json();
}

// Find recipes that use a given list of ingredients
export async function searchByIngredients(ingredients, number = 12) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    ingredients: ingredients.join(","), // comma-separated ingredient list
    number,
    ranking: 1,         // maximise used ingredients (1) vs minimise missing (2)
    ignorePantry: true, // exclude common pantry staples from missing count
  });
  const res = await fetch(`${BASE}/recipes/findByIngredients?${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  return res.json();
}

// Fetch a set of random recipes, optionally filtered by tags (e.g. "vegetarian,dessert")
export async function getRandomRecipes(number = 6, tags = "") {
  const params = new URLSearchParams({ apiKey: API_KEY, number, tags });
  const res = await fetch(`${BASE}/recipes/random?${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  const data = await res.json();
  return data.recipes; // unwrap from the "recipes" wrapper object
}