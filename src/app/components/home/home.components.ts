import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpoonacularService } from '../../services/spoonacular.service';
import { Recipe } from '../../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1>🍳 Welcome to Recipe Finder & Meal Planner</h1>
        <p>Discover amazing recipes and plan your weekly meals</p>
        
        <div class="search-bar">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search for recipes..."
            (keyup.enter)="search()"
          />
          <button (click)="search()" class="btn-primary">
            Search
          </button>
        </div>
      </div>

      <div class="recipe-of-day">
        <h2>✨ Recipe of the Day</h2>
        
        <div *ngIf="loading" class="loading">
          Loading recipe of the day...
        </div>
        
        <div *ngIf="error" class="error">
          {{error}}
        </div>
        
        <div *ngIf="recipeOfDay && !loading" class="recipe-card-large">
          <img [src]="recipeOfDay.image" [alt]="recipeOfDay.title" />
          <div class="recipe-info">
            <h3>{{recipeOfDay.title}}</h3>
            <div class="recipe-meta" *ngIf="recipeOfDay.readyInMinutes || recipeOfDay.servings">
              <span *ngIf="recipeOfDay.readyInMinutes">
                ⏱️ {{recipeOfDay.readyInMinutes}} mins
              </span>
              <span *ngIf="recipeOfDay.servings">
                🍽️ {{recipeOfDay.servings}} servings
              </span>
            </div>
            <div class="recipe-summary" *ngIf="recipeOfDay.summary" [innerHTML]="getSummary()">
            </div>
            <button (click)="viewRecipe(recipeOfDay.id)" class="btn-primary">
              View Full Recipe
            </button>
          </div>
        </div>
      </div>

      <div class="features">
        <h2>🎯 Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Search Recipes</h3>
            <p>Find recipes by ingredients, dietary preferences, and more</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📅</div>
            <h3>Meal Planning</h3>
            <p>Generate weekly meal plans tailored to your needs</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">❤️</div>
            <h3>Save Favorites</h3>
            <p>Keep track of your favorite recipes</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>Custom Recipes</h3>
            <p>Add and share your own recipes</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 2rem 0;
    }

    .hero-section {
      text-align: center;
      padding: 3rem 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      margin-bottom: 3rem;
    }

    .hero-section h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .hero-section p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }

    .search-bar {
      display: flex;
      justify-content: center;
      gap: 1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .search-bar input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
    }

    .btn-primary {
      background: white;
      color: #667eea;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .recipe-of-day {
      margin-bottom: 3rem;
    }

    .recipe-of-day h2 {
      font-size: 2rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .loading, .error {
      text-align: center;
      padding: 2rem;
      font-size: 1.1rem;
    }

    .error {
      color: #e74c3c;
    }

    .recipe-card-large {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .recipe-card-large img {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }

    .recipe-info {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .recipe-info h3 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      color: #2c3e50;
    }

    .recipe-meta {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
      color: #7f8c8d;
    }

    .recipe-summary {
      color: #34495e;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      max-height: 150px;
      overflow: hidden;
    }

    .features {
      margin-top: 3rem;
    }

    .features h2 {
      font-size: 2rem;
      margin-bottom: 2rem;
      text-align: center;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .feature-card p {
      color: #7f8c8d;
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .recipe-card-large {
        grid-template-columns: 1fr;
      }
      
      .hero-section h1 {
        font-size: 1.8rem;
      }
      
      .search-bar {
        flex-direction: column;
        padding: 0 1rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  searchQuery: string = '';
  recipeOfDay: Recipe | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private spoonacularService: SpoonacularService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadRecipeOfDay();
  }

  loadRecipeOfDay(): void {
    console.log('HomeComponent: loadRecipeOfDay called');
    this.loading = true;
    this.error = '';
    console.log('HomeComponent: loading set to true');

    this.spoonacularService.getRandomRecipe().subscribe({
      next: (response) => {
        console.log('HomeComponent: received response', response);
        console.log('HomeComponent: response.recipes exists?', !!response.recipes);
        console.log('HomeComponent: response.recipes length:', response.recipes?.length);

        if (response.recipes && response.recipes.length > 0) {
          this.recipeOfDay = response.recipes[0];
          console.log('HomeComponent: recipeOfDay set to', this.recipeOfDay);
          console.log('HomeComponent: recipeOfDay.title:', this.recipeOfDay?.title);
          console.log('HomeComponent: recipeOfDay.image:', this.recipeOfDay?.image);
        }
        this.loading = false;
        console.log('HomeComponent: loading set to false');
        console.log('HomeComponent: current state - loading:', this.loading, 'recipeOfDay:', !!this.recipeOfDay);
        this.cdr.detectChanges();
        console.log('HomeComponent: change detection triggered');
      },
      error: (err) => {
        console.error('HomeComponent: Error loading recipe:', err);
        if (err.status === 402) {
          this.error = 'API limit reached or invalid API key. Please check your Spoonacular API key and usage limits.';
        } else {
          this.error = `Failed to load recipe: ${err.statusText || 'Please check your API key.'}`;
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getSummary(): string {
    if (!this.recipeOfDay?.summary) return '';
    // Truncate summary to 200 characters
    const summary = this.recipeOfDay.summary;
    return summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery }
      });
    }
  }

  viewRecipe(id: number): void {
    this.router.navigate(['/recipes', id]);
  }
}