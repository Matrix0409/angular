// User Models
export interface User {
  id?: number;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

// Recipe Models
export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType?: string;
  summary?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
}

export interface RecipeDetails extends Recipe {
  extendedIngredients?: Ingredient[];
  analyzedInstructions?: Instruction[];
  nutrition?: Nutrition;
  diets?: string[];
  dishTypes?: string[];
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
}

export interface Instruction {
  name: string;
  steps: Step[];
}

export interface Step {
  number: number;
  step: string;
  ingredients?: any[];
  equipment?: any[];
}

export interface Nutrition {
  nutrients: Nutrient[];
  caloricBreakdown?: CaloricBreakdown;
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds?: number;
}

export interface CaloricBreakdown {
  percentProtein: number;
  percentFat: number;
  percentCarbs: number;
}

// Favorite Models
export interface Favorite {
  id?: number;
  userId: number;
  recipeId: number;
  title: string;
  image: string;
}

// Meal Plan Models
export interface MealPlan {
  id?: number;
  userId: number;
  name: string;
  week: string;
  planData: WeeklyPlanData;
}

export interface WeeklyPlanData {
  monday: DayPlan;
  tuesday: DayPlan;
  wednesday: DayPlan;
  thursday: DayPlan;
  friday: DayPlan;
  saturday: DayPlan;
  sunday: DayPlan;
}

export interface DayPlan {
  meals: Meal[];
  nutrients: DayNutrients;
}

export interface Meal {
  id: number;
  title: string;
  imageType: string;
  readyInMinutes?: number;
  servings?: number;
}

export interface DayNutrients {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

// Review Models
export interface Review {
  id?: number;
  recipeId: number;
  userId: number;
  rating: number;
  comment: string;
  date: string;
  userName?: string;
}

// Custom Recipe Models
export interface CustomRecipe {
  id?: string;
  userId: number;
  title: string;
  ingredients: string;
  instructions: string;
  image: string;
}

// Search Filter Models
export interface SearchFilters {
  query?: string;
  diet?: string[];
  intolerances?: string[];
  includeIngredients?: string;
  number?: number;
  offset?: number;
}

// Analytics Models
export interface Analytics {
  totalUsers: number;
  totalFavorites: number;
  totalMealPlans: number;
  mostReviewedRecipes: RecipeAnalytics[];
  highestRatedRecipes: RecipeAnalytics[];
}

export interface RecipeAnalytics {
  recipeId: number;
  title: string;
  reviewCount?: number;
  averageRating?: number;
}