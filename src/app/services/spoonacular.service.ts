import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Recipe, RecipeDetails, SearchFilters } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SpoonacularService {
  private apiUrl = environment.spoonacularBaseUrl;
  private apiKey = environment.spoonacularApiKey;

  constructor(private http: HttpClient) { }

  // Get random recipe for homepage
  getRandomRecipe(): Observable<any> {
    const params = new HttpParams()
      .set('apiKey', this.apiKey)
      .set('number', '1');
    const url = `${this.apiUrl}/recipes/random`;
    console.log('SpoonacularService: requesting', url, params.toString());

    return this.http.get(url, { params }).pipe(
      tap(response => console.log('SpoonacularService: response', response)),
      catchError((err) => {
        console.error('SpoonacularService: request error', err);
        return throwError(() => err);
      })
    );
  }

  // Basic recipe search
  searchRecipes(query: string, number: number = 12): Observable<any> {
    const params = new HttpParams()
      .set('apiKey', this.apiKey)
      .set('query', query)
      .set('number', number.toString())
      .set('addRecipeInformation', 'true');

    return this.http.get(`${this.apiUrl}/recipes/complexSearch`, { params });
  }

  // Advanced search with filters
  searchRecipesAdvanced(filters: SearchFilters): Observable<any> {
    let params = new HttpParams().set('apiKey', this.apiKey);

    if (filters.query) {
      params = params.set('query', filters.query);
    }

    if (filters.diet && filters.diet.length > 0) {
      params = params.set('diet', filters.diet.join(','));
    }

    if (filters.intolerances && filters.intolerances.length > 0) {
      params = params.set('intolerances', filters.intolerances.join(','));
    }

    if (filters.includeIngredients) {
      params = params.set('includeIngredients', filters.includeIngredients);
    }

    params = params.set('number', (filters.number || 12).toString());
    params = params.set('addRecipeInformation', 'true');

    if (filters.offset) {
      params = params.set('offset', filters.offset.toString());
    }

    return this.http.get(`${this.apiUrl}/recipes/complexSearch`, { params });
  }

  // Get recipe details by ID
  getRecipeDetails(id: number): Observable<RecipeDetails> {
    const params = new HttpParams()
      .set('apiKey', this.apiKey)
      .set('includeNutrition', 'true');

    return this.http.get<RecipeDetails>(`${this.apiUrl}/recipes/${id}/information`, { params });
  }

  // Generate weekly meal plan
  generateMealPlan(
    timeFrame: string = 'week',
    targetCalories?: number,
    diet?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('apiKey', this.apiKey)
      .set('timeFrame', timeFrame);

    if (targetCalories) {
      params = params.set('targetCalories', targetCalories.toString());
    }

    if (diet) {
      params = params.set('diet', diet);
    }

    return this.http.get(`${this.apiUrl}/mealplanner/generate`, { params });
  }

  // Get recipe information in bulk
  getRecipeInformationBulk(ids: number[]): Observable<any> {
    const params = new HttpParams()
      .set('apiKey', this.apiKey)
      .set('ids', ids.join(','))
      .set('includeNutrition', 'true');

    return this.http.get(`${this.apiUrl}/recipes/informationBulk`, { params });
  }

  // Get similar recipes
  getSimilarRecipes(id: number, number: number = 6): Observable<Recipe[]> {
    const params = new HttpParams()
      .set('apiKey', this.apiKey)
      .set('number', number.toString());

    return this.http.get<Recipe[]>(`${this.apiUrl}/recipes/${id}/similar`, { params });
  }

  // Autocomplete recipe search
  autocompleteRecipeSearch(query: string, number: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('apiKey', this.apiKey)
      .set('query', query)
      .set('number', number.toString());

    return this.http.get(`${this.apiUrl}/recipes/autocomplete`, { params });
  }
}