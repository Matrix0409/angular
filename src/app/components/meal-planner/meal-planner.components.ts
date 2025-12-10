import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpoonacularService } from '../../services/spoonacular.service';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/auth.service';
import { MealPlan, DayPlan, WeeklyPlanData } from '../../models/models';

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="meal-planner-container">
      <h1>📅 Weekly Meal Planner</h1>
      <p class="subtitle">Generate a personalized weekly meal plan based on your preferences</p>

      <!-- Generation Form -->
      <div class="planner-card" *ngIf="!generatedPlan">
        <h2>Create Your Meal Plan</h2>
        
        <div class="form-group">
          <label>Plan Name</label>
          <input 
            type="text" 
            [(ngModel)]="planName" 
            placeholder="e.g., My Weekly Plan"
          />
        </div>

        <div class="form-group">
          <label>Target Calories per Day</label>
          <input 
            type="number" 
            [(ngModel)]="targetCalories" 
            placeholder="2000"
            min="1200"
            max="4000"
          />
          <small>Recommended: 1500-2500 calories per day</small>
        </div>

        <div class="form-group">
          <label>Diet Type (Optional)</label>
          <select [(ngModel)]="selectedDiet">
            <option value="">None</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="glutenFree">Gluten Free</option>
            <option value="ketogenic">Ketogenic</option>
            <option value="paleo">Paleo</option>
            <option value="pescetarian">Pescetarian</option>
          </select>
        </div>

        <div class="form-actions">
          <button (click)="generateMealPlan()" class="btn-primary" [disabled]="loading">
            {{loading ? 'Generating...' : '🎯 Generate Meal Plan'}}
          </button>
        </div>

        <div *ngIf="error" class="error-message">
          {{error}}
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Generating your personalized meal plan...</p>
        <small>This may take a few moments</small>
      </div>

      <!-- Generated Plan Display -->
      <div class="generated-plan" *ngIf="generatedPlan && !loading">
        <div class="plan-header">
          <div>
            <h2>{{planName}}</h2>
            <p class="plan-meta">Week of {{getCurrentWeek()}}</p>
          </div>
          <div class="plan-actions">
            <button (click)="saveMealPlan()" class="btn-save" [disabled]="saving">
              {{saving ? 'Saving...' : '💾 Save Plan'}}
            </button>
            <button (click)="resetPlanner()" class="btn-secondary">
              🔄 Create New Plan
            </button>
          </div>
        </div>

        <div class="week-grid">
          <div class="day-card" *ngFor="let day of days">
            <div class="day-header">
              <h3>{{day | titlecase}}</h3>
              <div class="day-calories" *ngIf="generatedPlan.planData[day]">
                {{generatedPlan.planData[day].nutrients.calories || 0}} cal
              </div>
            </div>

            <div class="meals-list" *ngIf="generatedPlan.planData[day]">
              <div class="meal-item" *ngFor="let meal of generatedPlan.planData[day].meals">
                <img [src]="getMealImage(meal)" [alt]="meal.title" />
                <div class="meal-info">
                  <h4>{{meal.title}}</h4>
                  <p *ngIf="meal.readyInMinutes">⏱️ {{meal.readyInMinutes}} mins</p>
                  <button (click)="viewRecipe(meal.id)" class="btn-view-recipe">
                    View Recipe
                  </button>
                </div>
              </div>

              <div *ngIf="generatedPlan.planData[day].meals.length === 0" class="no-meals">
                No meals planned
              </div>
            </div>

            <div class="nutrition-summary" *ngIf="generatedPlan.planData[day]">
              <div class="nutrient">
                <span>Protein:</span>
                <strong>{{generatedPlan.planData[day].nutrients.protein || 0}}g</strong>
              </div>
              <div class="nutrient">
                <span>Fat:</span>
                <strong>{{generatedPlan.planData[day].nutrients.fat || 0}}g</strong>
              </div>
              <div class="nutrient">
                <span>Carbs:</span>
                <strong>{{generatedPlan.planData[day].nutrients.carbohydrates || 0}}g</strong>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="saveSuccess" class="success-message">
          ✅ Meal plan saved successfully! View it in your profile.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .meal-planner-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      text-align: center;
      color: #7f8c8d;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .planner-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 600px;
      margin: 0 auto;
    }

    .planner-card h2 {
      font-size: 1.8rem;
      color: #2c3e50;
      margin-bottom: 2rem;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group small {
      display: block;
      color: #7f8c8d;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .form-actions {
      margin-top: 2rem;
    }

    .btn-primary {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 6px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading small {
      color: #7f8c8d;
    }

    .error-message {
      background: #ffe5e5;
      color: #e74c3c;
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1rem;
      text-align: center;
    }

    .success-message {
      background: #d4edda;
      color: #27ae60;
      padding: 1rem;
      border-radius: 6px;
      margin-top: 2rem;
      text-align: center;
      font-weight: 600;
    }

    .generated-plan {
      margin-top: 2rem;
    }

    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .plan-header h2 {
      font-size: 2rem;
      color: #2c3e50;
      margin: 0;
    }

    .plan-meta {
      color: #7f8c8d;
      margin: 0.5rem 0 0 0;
    }

    .plan-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-save, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-save {
      background: #27ae60;
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      background: #229954;
      transform: translateY(-2px);
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-secondary:hover {
      background: #f8f9fa;
    }

    .week-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .day-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .day-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .day-header h3 {
      margin: 0;
      font-size: 1.3rem;
    }

    .day-calories {
      background: rgba(255,255,255,0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
    }

    .meals-list {
      padding: 1rem;
    }

    .meal-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .meal-item:last-child {
      margin-bottom: 0;
    }

    .meal-item img {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
    }

    .meal-info {
      flex: 1;
    }

    .meal-info h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
      font-size: 1rem;
    }

    .meal-info p {
      margin: 0 0 0.5rem 0;
      color: #7f8c8d;
      font-size: 0.875rem;
    }

    .btn-view-recipe {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-view-recipe:hover {
      background: #5568d3;
    }

    .no-meals {
      text-align: center;
      padding: 2rem;
      color: #7f8c8d;
    }

    .nutrition-summary {
      padding: 1rem;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-around;
    }

    .nutrient {
      text-align: center;
    }

    .nutrient span {
      display: block;
      color: #7f8c8d;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .nutrient strong {
      color: #2c3e50;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.8rem;
      }

      .planner-card {
        padding: 1.5rem;
      }

      .plan-header {
        flex-direction: column;
        gap: 1.5rem;
        align-items: flex-start;
      }

      .plan-actions {
        width: 100%;
        flex-direction: column;
      }

      .btn-save, .btn-secondary {
        width: 100%;
      }

      .week-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MealPlannerComponent implements OnInit {
  planName: string = 'My Weekly Plan';
  targetCalories: number = 2000;
  selectedDiet: string = '';

  generatedPlan: MealPlan | null = null;
  loading: boolean = false;
  saving: boolean = false;
  error: string = '';
  saveSuccess: boolean = false;

  days: (keyof WeeklyPlanData)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  constructor(
    private spoonacularService: SpoonacularService,
    private userDataService: UserDataService,
    private authService: AuthService
  ) { }

  ngOnInit(): void { }

  generateMealPlan(): void {
    if (!this.planName.trim()) {
      this.error = 'Please enter a plan name';
      return;
    }

    this.loading = true;
    this.error = '';
    this.saveSuccess = false;

    this.spoonacularService.generateMealPlan('week', this.targetCalories, this.selectedDiet).subscribe({
      next: (response) => {
        // Transform API response to our MealPlan format
        const planData: any = {
          monday: { meals: [], nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 } },
          tuesday: { meals: [], nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 } },
          wednesday: { meals: [], nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 } },
          thursday: { meals: [], nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 } },
          friday: { meals: [], nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 } },
          saturday: { meals: [], nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 } },
          sunday: { meals: [], nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 } }
        };

        // Parse the week data from API
        if (response.week) {
          Object.keys(response.week).forEach((day) => {
            const dayData = response.week[day];
            // day is already 'monday', 'tuesday', etc. from the API response

            planData[day] = {
              meals: dayData.meals || [],
              nutrients: dayData.nutrients || { calories: 0, protein: 0, fat: 0, carbohydrates: 0 }
            };
          });
        } else {
          console.warn('MealPlannerComponent: No week data in response');
        }

        this.generatedPlan = {
          userId: this.authService.currentUserValue?.id || 0,
          name: this.planName,
          week: this.getCurrentWeek(),
          planData: planData
        };

        this.loading = false;
      },
      error: (err) => {
        console.error('Error generating meal plan:', err);
        this.error = 'Failed to generate meal plan. Please check your API key and try again.';
        this.loading = false;
      }
    });
  }

  saveMealPlan(): void {
    if (!this.generatedPlan) return;

    this.saving = true;
    this.userDataService.saveMealPlan(this.generatedPlan).subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = true;
        setTimeout(() => {
          this.saveSuccess = false;
        }, 3000);
      },
      error: (err) => {
        console.error('Error saving meal plan:', err);
        this.error = 'Failed to save meal plan';
        this.saving = false;
      }
    });
  }

  resetPlanner(): void {
    this.generatedPlan = null;
    this.planName = 'My Weekly Plan';
    this.targetCalories = 2000;
    this.selectedDiet = '';
    this.error = '';
    this.saveSuccess = false;
  }

  viewRecipe(id: number): void {
    window.open(`/recipes/${id}`, '_blank');
  }

  getMealImage(meal: any): string {
    if (meal.image) {
      return meal.image;
    }
    return `https://spoonacular.com/recipeImages/${meal.id}-312x231.${meal.imageType || 'jpg'}`;
  }

  getCurrentWeek(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}