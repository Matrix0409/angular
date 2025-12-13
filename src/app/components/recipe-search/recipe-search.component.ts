import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SpoonacularService } from '../../services/spoonacular.service';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/auth.service';
import { Recipe, Favorite } from '../../models/models';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';

@Component({
  selector: 'app-recipe-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RecipeCardComponent],
  template: `
    <div class="search-container">
      <div class="search-header">
        <h1>🔍 Search Recipes</h1>
        
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

      <div class="results-info" *ngIf="recipes.length > 0 && !loading">
        <p>Found {{totalResults}} recipes</p>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Searching for recipes...</p>
      </div>

      <div *ngIf="error" class="error">
        {{error}}
      </div>

      <div *ngIf="!loading && recipes.length === 0 && searchQuery" class="no-results">
        <p>No recipes found for "{{searchQuery}}"</p>
        <p>Try searching with different keywords</p>
      </div>

      <div class="recipes-grid" *ngIf="recipes.length > 0 && !loading">
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
  `,
  styles: [`
    .search-container {
      padding: 2rem 0;
    }

    .search-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .search-header h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .search-bar {
      display: flex;
      gap: 1rem;
      max-width: 700px;
      margin: 0 auto;
    }

    .search-bar input {
      flex: 1;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .search-bar input:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .results-info {
      text-align: center;
      margin-bottom: 2rem;
      color: #7f8c8d;
      font-size: 1.1rem;
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
      font-size: 1.1rem;
      background: #ffe5e5;
      border-radius: 8px;
      margin: 2rem 0;
    }

    .no-results {
      text-align: center;
      padding: 4rem 2rem;
    }

    .no-results p:first-child {
      font-size: 1.3rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .no-results p:last-child {
      color: #7f8c8d;
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
      .search-header h1 {
        font-size: 1.8rem;
      }

      .search-bar {
        flex-direction: column;
        padding: 0 1rem;
      }

      .recipes-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
      }
    }
  `]
})
export class RecipeSearchComponent implements OnInit {
  searchQuery: string = '';
  recipes: Recipe[] = [];
  favorites: Favorite[] = [];
  loading: boolean = false;
  error: string = '';

  currentPage: number = 1;
  recipesPerPage: number = 12;
  totalResults: number = 0;
  totalPages: number = 0;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  constructor(
    private route: ActivatedRoute,
    private spoonacularService: SpoonacularService,
    private userDataService: UserDataService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Get search query from URL params
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.search();
      }
    });

    // Load favorites if logged in
    if (this.isLoggedIn) {
      this.loadFavorites();
    } else {
      this.loadGuestFavorites();
    }
  }

  search(): void {
    if (!this.searchQuery.trim()) {
      return;
    }

    console.log('RecipeSearch: search called with query:', this.searchQuery);
    this.loading = true;
    this.error = '';
    this.currentPage = 1;

    this.spoonacularService.searchRecipes(this.searchQuery, this.recipesPerPage).subscribe({
      next: (response) => {
        console.log('RecipeSearch: received response', response);
        this.recipes = response.results || [];
        this.totalResults = response.totalResults || 0;
        this.totalPages = Math.ceil(this.totalResults / this.recipesPerPage);
        this.loading = false;
        console.log('RecipeSearch: loading set to false, recipes count:', this.recipes.length);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('RecipeSearch: Search error:', err);
        if (err.status === 402) {
          this.error = 'API limit reached or invalid API key. Please check your Spoonacular API key at https://spoonacular.com/food-api';
        } else {
          this.error = `Failed to search recipes: ${err.statusText || 'Please check your API key and try again.'}`;
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadFavorites(): void {
    const userId = this.authService.currentUserValue?.id;
    if (userId) {
      this.userDataService.getFavoritesByUserId(userId).subscribe({
        next: (favorites) => {
          this.favorites = favorites;
        },
        error: (err) => {
          console.error('Error loading favorites:', err);
        }
      });
    }
  }

  loadGuestFavorites(): void {
    this.favorites = this.userDataService.getGuestFavorites();
  }

  isFavorite(recipeId: number | string): boolean {
    return this.favorites.some(fav => fav.recipeId == recipeId);
  }

  toggleFavorite(recipe: Recipe): void {
    if (!this.isLoggedIn) {
      this.toggleGuestFavorite(recipe);
      return;
    }

    const userId = this.authService.currentUserValue?.id;
    if (!userId) return;

    const existingFavorite = this.favorites.find(fav => fav.recipeId === recipe.id);

    if (existingFavorite && existingFavorite.id) {
      // Remove favorite
      this.userDataService.removeFavorite(existingFavorite.id).subscribe({
        next: () => {
          this.favorites = this.favorites.filter(fav => fav.id !== existingFavorite.id);
        },
        error: (err) => {
          console.error('Error removing favorite:', err);
          alert('Failed to remove favorite');
        }
      });
    } else {
      // Add favorite
      const favorite: Favorite = {
        userId: userId,
        recipeId: recipe.id,
        title: recipe.title,
        image: recipe.image
      };

      this.userDataService.addFavorite(favorite).subscribe({
        next: (newFavorite) => {
          this.favorites.push(newFavorite);
        },
        error: (err) => {
          console.error('Error adding favorite:', err);
          alert('Failed to add favorite');
        }
      });
    }
  }

  toggleGuestFavorite(recipe: Recipe): void {
    const existingFavorite = this.favorites.find(fav => fav.recipeId === recipe.id);
    if (existingFavorite) {
      this.userDataService.removeGuestFavorite(recipe.id);
      this.favorites = this.favorites.filter(fav => fav.recipeId !== recipe.id);
    } else {
      const favorite: Favorite = {
        userId: 0,
        recipeId: recipe.id,
        title: recipe.title,
        image: recipe.image
      };
      this.userDataService.saveGuestFavorite(favorite);
      this.favorites.push(favorite);
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