import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserDataService } from '../../services/user-data.service';
import { User, Favorite, MealPlan, CustomRecipe } from '../../models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-container" *ngIf="user">
      <div class="profile-header">
        <div class="profile-avatar">
          {{ user.name.charAt(0).toUpperCase() }}
        </div>
        <div class="profile-info">
          <h1>{{ user.name }}</h1>
          <p>{{ user.email }}</p>
          <span class="badge" *ngIf="user.isAdmin">Admin</span>
        </div>
      </div>

      <div class="profile-tabs">
        <button 
          [class.active]="activeTab === 'favorites'" 
          (click)="activeTab = 'favorites'; loadFavorites()"
          class="tab-button"
        >
          ❤️ Favorites ({{favorites.length}})
        </button>
        <button 
          [class.active]="activeTab === 'meal-plans'" 
          (click)="activeTab = 'meal-plans'"
          class="tab-button"
        >
          📅 Meal Plans ({{mealPlans.length}})
        </button>
        <button 
          [class.active]="activeTab === 'custom'" 
          (click)="activeTab = 'custom'"
          class="tab-button"
        >
          📝 My Recipes ({{customRecipes.length}})
        </button>
      </div>

      <!-- Favorites Tab -->
      <div class="tab-content" *ngIf="activeTab === 'favorites'">
        <div class="section-header">
          <h2>Your Favorite Recipes</h2>
          <button (click)="goToSearch()" class="btn-primary">
            + Add More Favorites
          </button>
        </div>

        <div *ngIf="favorites.length === 0" class="empty-state">
          <p>You haven't saved any favorite recipes yet</p>
          <button (click)="goToSearch()" class="btn-secondary">
            Browse Recipes
          </button>
        </div>

        <div class="favorites-grid" *ngIf="favorites.length > 0">
          <div class="favorite-card" *ngFor="let favorite of favorites">
            <img [src]="favorite.image" [alt]="favorite.title" />
            <div class="favorite-info">
              <h3>{{favorite.title}}</h3>
              <div class="favorite-actions">
                <button (click)="viewRecipe(favorite.recipeId)" class="btn-view">
                  View Recipe
                </button>
                <button (click)="removeFavorite(favorite)" class="btn-remove">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Meal Plans Tab -->
      <div class="tab-content" *ngIf="activeTab === 'meal-plans'">
        <div class="section-header">
          <h2>Your Meal Plans</h2>
          <button (click)="goToMealPlanner()" class="btn-primary">
            + Create New Plan
          </button>
        </div>

        <div *ngIf="mealPlans.length === 0" class="empty-state">
          <p>You haven't created any meal plans yet</p>
          <button (click)="goToMealPlanner()" class="btn-secondary">
            Create Meal Plan
          </button>
        </div>

        <div class="meal-plans-list" *ngIf="mealPlans.length > 0">
          <div class="meal-plan-card" *ngFor="let plan of mealPlans">
            <div class="plan-header">
              <div>
                <h3>{{plan.name}}</h3>
                <p class="plan-week">Week of {{formatDate(plan.week)}}</p>
              </div>
              <button (click)="deleteMealPlan(plan)" class="btn-delete">
                🗑️ Delete
              </button>
            </div>
            <div class="plan-summary">
              <span *ngFor="let day of getDays()">
                {{day}}: {{getMealCount(plan, day)}} meals
              </span>
            </div>
            <button (click)="viewMealPlan(plan)" class="btn-view-plan">
              View Full Plan
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Recipes Tab -->
      <div class="tab-content" *ngIf="activeTab === 'custom'">
        <div class="section-header">
          <h2>Your Custom Recipes</h2>
          <button (click)="goToCustomRecipe()" class="btn-primary">
            + Add Recipe
          </button>
        </div>

        <div *ngIf="customRecipes.length === 0" class="empty-state">
          <p>You haven't added any custom recipes yet</p>
          <button (click)="goToCustomRecipe()" class="btn-secondary">
            Add Your First Recipe
          </button>
        </div>

        <div class="custom-recipes-grid" *ngIf="customRecipes.length > 0">
          <div class="custom-recipe-card" *ngFor="let recipe of customRecipes">
            <img [src]="recipe.image" [alt]="recipe.title" />
            <div class="recipe-info">
              <h3>{{recipe.title}}</h3>
              <p class="recipe-preview">{{getPreview(recipe.ingredients)}}</p>
              <div class="recipe-actions">
                <button (click)="viewCustomRecipe(recipe)" class="btn-view">
                  View
                </button>
                <button (click)="deleteCustomRecipe(recipe)" class="btn-remove">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Meal Plan Detail Modal -->
      <div class="modal-overlay" *ngIf="selectedMealPlan" (click)="closeMealPlanModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{selectedMealPlan.name}}</h2>
            <button (click)="closeMealPlanModal()" class="modal-close">✕</button>
          </div>
          <p class="modal-date">Week of {{formatDate(selectedMealPlan.week)}}</p>

          <div class="week-days">
            <div class="day-section" *ngFor="let day of getDays()">
              <h3>{{day | titlecase}}</h3>
              
              <div class="day-meals" *ngIf="hasDayData(selectedMealPlan, day)">
                <div class="meal-summary">
                  <strong>Calories:</strong> {{getDayNutrients(selectedMealPlan, day).calories | number:'1.0-0'}} cal
                  <span class="nutrient-detail">
                    Protein: {{getDayNutrients(selectedMealPlan, day).protein | number:'1.0-0'}}g
                  </span>
                  <span class="nutrient-detail">
                    Carbs: {{getDayNutrients(selectedMealPlan, day).carbohydrates | number:'1.0-0'}}g
                  </span>
                  <span class="nutrient-detail">
                    Fat: {{getDayNutrients(selectedMealPlan, day).fat | number:'1.0-0'}}g
                  </span>
                </div>

                <div class="meals-grid">
                  <div class="meal-card" *ngFor="let meal of getDayMeals(selectedMealPlan, day)">
                    <img [src]="getMealImage(meal)" [alt]="meal.title" />
                    <div class="meal-details">
                      <h4>{{meal.title}}</h4>
                      <p *ngIf="meal.readyInMinutes">⏱️ {{meal.readyInMinutes}} mins</p>
                      <p *ngIf="meal.servings">🍽️ {{meal.servings}} servings</p>
                      <button (click)="viewRecipe(meal.id)" class="btn-view-recipe">View Recipe</button>
                    </div>
                  </div>
                </div>
                
                <div *ngIf="getDayMeals(selectedMealPlan, day).length === 0" class="no-meals-day">
                  No meals planned for this day
                </div>
              </div>

              <div *ngIf="!hasDayData(selectedMealPlan, day)" class="no-meals-day">
                No data available for this day
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: white;
      color: #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: bold;
    }

    .profile-info h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
    }

    .profile-info p {
      margin: 0;
      opacity: 0.9;
    }

    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .profile-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #e0e0e0;
    }

    .tab-button {
      background: none;
      border: none;
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      color: #7f8c8d;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.3s;
    }

    .tab-button.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }

    .tab-content {
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .section-header h2 {
      font-size: 1.8rem;
      color: #2c3e50;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .empty-state p {
      font-size: 1.2rem;
      color: #7f8c8d;
      margin-bottom: 1.5rem;
    }

    .favorites-grid, .custom-recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .favorite-card, .custom-recipe-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }

    .favorite-card:hover, .custom-recipe-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .favorite-card img, .custom-recipe-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .favorite-info, .recipe-info {
      padding: 1.25rem;
    }

    .favorite-info h3, .recipe-info h3 {
      font-size: 1.1rem;
      color: #2c3e50;
      margin: 0 0 1rem 0;
    }

    .recipe-preview {
      color: #7f8c8d;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .favorite-actions, .recipe-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-view, .btn-remove {
      flex: 1;
      padding: 0.625rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-view {
      background: #667eea;
      color: white;
    }

    .btn-remove {
      background: #e74c3c;
      color: white;
    }

    .meal-plans-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .meal-plan-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .plan-header h3 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0;
    }

    .plan-week {
      color: #7f8c8d;
      margin: 0.5rem 0 0 0;
    }

    .btn-delete {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .plan-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
      color: #7f8c8d;
      font-size: 0.875rem;
    }

    .btn-view-plan {
      width: 100%;
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
      }

      .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .profile-tabs {
        flex-direction: column;
      }

      .tab-button {
        text-align: left;
        border-bottom: none;
        border-left: 3px solid transparent;
      }

      .tab-button.active {
        border-bottom: none;
        border-left-color: #667eea;
      }
    }

    /* Meal Plan Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 1rem;
      overflow-y: auto;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 1200px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 2rem;
      position: relative;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 2rem;
      color: #2c3e50;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #7f8c8d;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s;
    }

    .modal-close:hover {
      background: #f8f9fa;
      color: #2c3e50;
    }

    .modal-date {
      color: #7f8c8d;
      margin: 0.5rem 0 2rem 0;
      font-size: 1.1rem;
    }

    .week-days {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .day-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
    }

    .day-section h3 {
      color: #667eea;
      font-size: 1.5rem;
      margin: 0 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #667eea;
    }

    .meal-summary {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }

    .meal-summary strong {
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .nutrient-detail {
      color: #7f8c8d;
      font-size: 0.95rem;
      padding: 0.25rem 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .meals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .meal-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }

    .meal-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .meal-card img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .meal-details {
      padding: 1rem;
    }

    .meal-details h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
      font-size: 1rem;
    }

    .meal-details p {
      margin: 0.25rem 0;
      color: #7f8c8d;
      font-size: 0.875rem;
    }

    .btn-view-recipe {
      width: 100%;
      margin-top: 0.75rem;
      padding: 0.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-view-recipe:hover {
      background: #5568d3;
    }

    .no-meals-day {
      text-align: center;
      padding: 2rem;
      color: #7f8c8d;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .modal-content {
        padding: 1.5rem;
        max-height: 95vh;
      }

      .modal-header h2 {
        font-size: 1.5rem;
      }

      .meals-grid {
        grid-template-columns: 1fr;
      }

      .meal-summary {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  favorites: Favorite[] = [];
  mealPlans: MealPlan[] = [];
  customRecipes: CustomRecipe[] = [];
  activeTab: string = 'favorites';
  selectedMealPlan: MealPlan | null = null;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    if (this.user?.id) {
      this.loadFavorites();
      this.loadMealPlans();
      this.loadCustomRecipes();
    }
  }

  loadFavorites(): void {
    if (this.user?.id) {
      console.log('Profile: loadFavorites called for user:', this.user.id);
      this.userDataService.getFavoritesByUserId(this.user.id).subscribe({
        next: (favorites) => {
          console.log('Profile: received favorites', favorites);
          this.favorites = favorites;
          console.log('Profile: favorites count:', this.favorites.length);
          this.cdr.detectChanges();
          console.log('Profile: change detection triggered for favorites');
        },
        error: (err) => {
          console.error('Profile: Error loading favorites:', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadMealPlans(): void {
    if (this.user?.id) {
      this.userDataService.getMealPlansByUserId(this.user.id).subscribe({
        next: (plans) => {
          this.mealPlans = plans;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Profile: Error loading meal plans:', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadCustomRecipes(): void {
    if (this.user?.id) {
      this.userDataService.getCustomRecipesByUserId(this.user.id).subscribe({
        next: (recipes) => {
          this.customRecipes = recipes;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Profile: Error loading custom recipes:', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

  viewRecipe(recipeId: number): void {
    this.router.navigate(['/recipes', recipeId]);
  }

  removeFavorite(favorite: Favorite): void {
    if (confirm('Remove this recipe from favorites?')) {
      if (favorite.id) {
        this.userDataService.removeFavorite(favorite.id).subscribe({
          next: () => {
            this.favorites = this.favorites.filter(f => f.id !== favorite.id);
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  deleteMealPlan(plan: MealPlan): void {
    if (confirm(`Delete meal plan "${plan.name}"?`)) {
      if (plan.id) {
        this.userDataService.deleteMealPlan(plan.id).subscribe({
          next: () => {
            this.mealPlans = this.mealPlans.filter(p => p.id !== plan.id);
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  viewMealPlan(plan: MealPlan): void {
    this.selectedMealPlan = plan;
  }

  closeMealPlanModal(): void {
    this.selectedMealPlan = null;
  }

  getMealImage(meal: any): string {
    if (meal.image) {
      return meal.image;
    }
    return `https://spoonacular.com/recipeImages/${meal.id}-312x231.${meal.imageType || 'jpg'}`;
  }

  viewCustomRecipe(recipe: CustomRecipe): void {
    if (recipe.id) {
      this.router.navigate(['/custom-recipe', recipe.id]);
    } else {
      this.router.navigate(['/custom-recipe']);
    }
  }

  deleteCustomRecipe(recipe: CustomRecipe): void {
    if (confirm(`Delete recipe "${recipe.title}"?`)) {
      if (recipe.id) {
        this.userDataService.deleteCustomRecipe(recipe.id).subscribe({
          next: () => {
            this.customRecipes = this.customRecipes.filter(r => r.id !== recipe.id);
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  getDays(): string[] {
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  }

  getMealCount(plan: MealPlan, day: string): number {
    const dayData = (plan.planData as any)[day];
    return dayData?.meals?.length || 0;
  }

  getPreview(text: string): string {
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  goToSearch(): void {
    this.router.navigate(['/search']);
  }

  goToMealPlanner(): void {
    this.router.navigate(['/meal-planner']);
  }

  goToCustomRecipe(): void {
    this.router.navigate(['/custom-recipe']);
  }
  getDayData(plan: MealPlan, day: string): any {
    if (!plan || !plan.planData) return null;
    return (plan.planData as any)[day];
  }

  hasDayData(plan: MealPlan, day: string): boolean {
    const data = this.getDayData(plan, day);
    return !!data;
  }

  getDayMeals(plan: MealPlan, day: string): any[] {
    const data = this.getDayData(plan, day);
    return data?.meals || [];
  }

  getDayNutrients(plan: MealPlan, day: string): any {
    const data = this.getDayData(plan, day);
    return data?.nutrients || { calories: 0, protein: 0, fat: 0, carbohydrates: 0 };
  }
}