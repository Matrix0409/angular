import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpoonacularService } from '../../services/spoonacular.service';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/auth.service';
import { Recipe, SearchFilters, Favorite } from '../../models/models';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RecipeCardComponent],
  template: `
    <div class="advanced-search-container">
      <h1>🔍 Advanced Recipe Search</h1>
      <p class="subtitle">Filter recipes by dietary preferences, intolerances, and ingredients</p>

      <div class="filters-card">
        <div class="filter-section">
          <label>Search Query</label>
          <input 
            type="text" 
            [(ngModel)]="filters.query" 
            placeholder="e.g., pasta, chicken, soup..."
          />
        </div>

        <div class="filter-section">
          <label>Diet Type</label>
          <div class="checkbox-group">
            <label *ngFor="let diet of dietOptions" class="checkbox-label">
              <input 
                type="checkbox" 
                [value]="diet" 
                (change)="onDietChange($event)"
              />
              {{diet}}
            </label>
          </div>
        </div>

        <div class="filter-section">
          <label>Intolerances</label>
          <div class="checkbox-group">
            <label *ngFor="let intolerance of intoleranceOptions" class="checkbox-label">
              <input 
                type="checkbox" 
                [value]="intolerance" 
                (change)="onIntoleranceChange($event)"
              />
              {{intolerance}}
            </label>
          </div>
        </div>

        <div class="filter-section">
          <label>Include Ingredients (comma-separated)</label>
          <input 
            type="text" 
            [(ngModel)]="filters.includeIngredients" 
            placeholder="e.g., tomatoes, chicken, basil"
          />
        </div>

        <div class="filter-actions">
          <button (click)="search()" class="btn-primary">
            🔍 Search Recipes
          </button>
          <button (click)="clearFilters()" class="btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Searching recipes...</p>
      </div>

      <div *ngIf="error" class="error">
        {{error}}
      </div>

      <div class="results-section" *ngIf="!loading && hasSearched">
        <div class="results-header">
          <h2>Search Results</h2>
          <p *ngIf="recipes.length > 0">Found {{totalResults}} recipes</p>
          <p *ngIf="recipes.length === 0">No recipes found matching your criteria</p>
        </div>

        <div class="recipes-grid" *ngIf="recipes.length > 0">
          <app-recipe-card 
            *ngFor="let recipe of recipes"
            [recipe]="recipe"
            [isFavorite]="isFavorite(recipe.id)"
            [showFavorite]="true"
            (favoriteToggle)="toggleFavorite($event)"
          ></app-recipe-card>
        </div>

        <div class="pagination" *ngIf="recipes.length > 0 && totalResults > recipesPerPage">
          <button 
            (click)="previousPage()" 
            [disabled]="currentPage === 1"
            class="btn-pagination"
          >
            Previous
          </button>
          <span class="page-info">Page {{currentPage}} of {{totalPages}}</span>
          <button 
            (click)="nextPage()" 
            [disabled]="currentPage === totalPages"
            class="btn-pagination"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .advanced-search-container {
      max-width: 1200px;
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

    .filters-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 3rem;
    }

    .filter-section {
      margin-bottom: 2rem;
    }

    .filter-section label:first-child {
      display: block;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.75rem;
      font-size: 1.1rem;
    }

    .filter-section input[type="text"] {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .filter-section input[type="text"]:focus {
      outline: none;
      border-color: #667eea;
    }

    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
      font-weight: normal;
    }

    .checkbox-label:hover {
      background: #f8f9fa;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .filter-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 1rem 2rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
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

    .btn-secondary:hover {
      background: #f8f9fa;
    }

    .loading {
      text-align: center;
      padding: 4rem 0;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      text-align: center;
      padding: 2rem;
      color: #e74c3c;
      background: #ffe5e5;
      border-radius: 8px;
      margin: 2rem 0;
    }

    .results-section {
      margin-top: 3rem;
    }

    .results-header {
      margin-bottom: 2rem;
    }

    .results-header h2 {
      font-size: 2rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .results-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2rem;
      margin-top: 3rem;
    }

    .btn-pagination {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-pagination:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }

    .btn-pagination:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      color: #2c3e50;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.8rem;
      }

      .filters-card {
        padding: 1.5rem;
      }

      .checkbox-group {
        grid-template-columns: 1fr;
      }

      .filter-actions {
        flex-direction: column;
      }

      .recipes-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
    }
  `]
})
export class AdvancedSearchComponent implements OnInit {
  filters: SearchFilters = {
    query: '',
    diet: [],
    intolerances: [],
    includeIngredients: '',
    number: 12
  };

  dietOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten Free',
    'Ketogenic',
    'Paleo',
    'Pescetarian',
    'Primal',
    'Low FODMAP',
    'Whole30'
  ];

  intoleranceOptions = [
    'Dairy',
    'Egg',
    'Gluten',
    'Grain',
    'Peanut',
    'Seafood',
    'Sesame',
    'Shellfish',
    'Soy',
    'Sulfite',
    'Tree Nut',
    'Wheat'
  ];

  recipes: Recipe[] = [];
  favorites: Favorite[] = [];
  loading: boolean = false;
  error: string = '';
  hasSearched: boolean = false;

  currentPage: number = 1;
  recipesPerPage: number = 12;
  totalResults: number = 0;
  totalPages: number = 0;

  constructor(
    private spoonacularService: SpoonacularService,
    private userDataService: UserDataService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  onDietChange(event: any): void {
    const value = event.target.value;
    if (event.target.checked) {
      this.filters.diet?.push(value);
    } else {
      this.filters.diet = this.filters.diet?.filter(d => d !== value);
    }
  }

  onIntoleranceChange(event: any): void {
    const value = event.target.value;
    if (event.target.checked) {
      this.filters.intolerances?.push(value);
    } else {
      this.filters.intolerances = this.filters.intolerances?.filter(i => i !== value);
    }
  }

  search(): void {
    console.log('AdvancedSearch: search called with filters:', this.filters);
    this.loading = true;
    this.error = '';
    this.hasSearched = true;
    this.currentPage = 1;

    const searchFilters = {
      ...this.filters,
      offset: (this.currentPage - 1) * this.recipesPerPage
    };

    this.spoonacularService.searchRecipesAdvanced(searchFilters).subscribe({
      next: (response) => {
        console.log('AdvancedSearch: received response', response);
        this.recipes = response.results || [];
        this.totalResults = response.totalResults || 0;
        this.totalPages = Math.ceil(this.totalResults / this.recipesPerPage);
        this.loading = false;
        console.log('AdvancedSearch: loading set to false, recipes count:', this.recipes.length);
        this.cdr.detectChanges();
        console.log('AdvancedSearch: change detection triggered');
      },
      error: (err) => {
        console.error('AdvancedSearch: Search error:', err);
        if (err.status === 402) {
          this.error = 'API limit reached or invalid API key. Please check your Spoonacular API key at https://spoonacular.com/food-api';
        } else {
          this.error = `Failed to search recipes: ${err.statusText || 'Please try again.'}`;
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearFilters(): void {
    this.filters = {
      query: '',
      diet: [],
      intolerances: [],
      includeIngredients: '',
      number: 12
    };
    this.recipes = [];
    this.hasSearched = false;

    // Reset all checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
    });
  }

  loadFavorites(): void {
    const userId = this.authService.currentUserValue?.id;
    if (userId) {
      this.userDataService.getFavoritesByUserId(userId).subscribe({
        next: (favorites) => {
          this.favorites = favorites;
        }
      });
    }
  }

 isFavorite(recipeId: string | number): boolean {
  const id = typeof recipeId === 'string' ? parseInt(recipeId, 10) : recipeId;
  return this.favorites.some(fav => fav.recipeId === id);
}
  toggleFavorite(recipe: Recipe): void {
    const userId = this.authService.currentUserValue?.id;
    if (!userId) return;

    const existingFavorite = this.favorites.find(fav => fav.recipeId === recipe.id);

    if (existingFavorite && existingFavorite.id) {
      this.userDataService.removeFavorite(existingFavorite.id).subscribe({
        next: () => {
          this.favorites = this.favorites.filter(fav => fav.id !== existingFavorite.id);
        }
      });
    } else {
      const favorite: Favorite = {
        userId: userId,
        recipeId: recipe.id,
        title: recipe.title,
        image: recipe.image
      };

      this.userDataService.addFavorite(favorite).subscribe({
        next: (newFavorite) => {
          this.favorites.push(newFavorite);
        }
      });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.search();
      window.scrollTo(0, 0);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.search();
      window.scrollTo(0, 0);
    }
  }
}
