import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  User,
  Favorite,
  MealPlan,
  Review,
  CustomRecipe
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private apiUrl = environment.jsonServerUrl;

  constructor(private http: HttpClient) { }

  // User Management
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  // Favorites Management
  getFavoritesByUserId(userId: number): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/favorites?userId=${userId}`);
  }

  addFavorite(favorite: Favorite): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.apiUrl}/favorites`, favorite);
  }

  removeFavorite(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favorites/${id}`);
  }

  checkIfFavorite(userId: number, recipeId: number): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(
      `${this.apiUrl}/favorites?userId=${userId}&recipeId=${recipeId}`
    );
  }

  getAllFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/favorites`);
  }

  deleteFavoritesByUserId(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favorites?userId=${userId}`);
  }

  // Meal Plans Management
  getMealPlansByUserId(userId: number): Observable<MealPlan[]> {
    return this.http.get<MealPlan[]>(`${this.apiUrl}/mealPlans?userId=${userId}`);
  }

  getMealPlanById(id: number): Observable<MealPlan> {
    return this.http.get<MealPlan>(`${this.apiUrl}/mealPlans/${id}`);
  }

  saveMealPlan(mealPlan: MealPlan): Observable<MealPlan> {
    return this.http.post<MealPlan>(`${this.apiUrl}/mealPlans`, mealPlan);
  }

  updateMealPlan(id: number, mealPlan: Partial<MealPlan>): Observable<MealPlan> {
    return this.http.patch<MealPlan>(`${this.apiUrl}/mealPlans/${id}`, mealPlan);
  }

  deleteMealPlan(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/mealPlans/${id}`);
  }

  getAllMealPlans(): Observable<MealPlan[]> {
    return this.http.get<MealPlan[]>(`${this.apiUrl}/mealPlans`);
  }

  deleteMealPlansByUserId(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/mealPlans?userId=${userId}`);
  }

  // Reviews Management
  getReviewsByRecipeId(recipeId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews?recipeId=${recipeId}`);
  }

  getReviewsByUserId(userId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews?userId=${userId}`);
  }

  addReview(review: Review): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, review);
  }

  updateReview(id: number, review: Partial<Review>): Observable<Review> {
    return this.http.patch<Review>(`${this.apiUrl}/reviews/${id}`, review);
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${id}`);
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews`);
  }

  deleteReviewsByUserId(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews?userId=${userId}`);
  }

  // Custom Recipes Management
  getCustomRecipesByUserId(userId: number): Observable<CustomRecipe[]> {
    return this.http.get<CustomRecipe[]>(`${this.apiUrl}/customRecipes?userId=${userId}`);
  }

  getCustomRecipeById(id: string): Observable<CustomRecipe> {
    return this.http.get<CustomRecipe>(`${this.apiUrl}/customRecipes/${id}`);
  }

  addCustomRecipe(recipe: CustomRecipe): Observable<CustomRecipe> {
    return this.http.post<CustomRecipe>(`${this.apiUrl}/customRecipes`, recipe);
  }

  updateCustomRecipe(id: string, recipe: Partial<CustomRecipe>): Observable<CustomRecipe> {
    return this.http.patch<CustomRecipe>(`${this.apiUrl}/customRecipes/${id}`, recipe);
  }

  deleteCustomRecipe(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customRecipes/${id}`);
  }

  getAllCustomRecipes(): Observable<CustomRecipe[]> {
    return this.http.get<CustomRecipe[]>(`${this.apiUrl}/customRecipes`);
  }

  deleteCustomRecipesByUserId(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customRecipes?userId=${userId}`);
  }
}