const API_KEY = "afb3440c473641b09be8ce264d99248a";
const BASE = "https://api.spoonacular.com";

// Search recipes
export async function searchRecipes({ query, cuisine = "", diet = "", number = 12 }) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    query,
    cuisine,
    diet,
    number,
    addRecipeInformation: true,
    fillIngredients: false,
  });
  const res = await fetch(`${BASE}/recipes/complexSearch?${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  const data = await res.json();
  return data.results; 
}

// full recipe details
export async function getRecipeDetail(id) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    includeNutrition: false,
  });
  const res = await fetch(`${BASE}/recipes/${id}/information?${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  return res.json();
}

// Search by ingredients
export async function searchByIngredients(ingredients, number = 12) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    ingredients: ingredients.join(","),
    number,
    ranking: 1,
    ignorePantry: true,
  });
  const res = await fetch(`${BASE}/recipes/findByIngredients?${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  return res.json();
}

// random recipes
export async function getRandomRecipes(number = 6, tags = "") {
  const params = new URLSearchParams({ apiKey: API_KEY, number, tags });
  const res = await fetch(`${BASE}/recipes/random?${params}`);
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  const data = await res.json();
  return data.recipes;
}
