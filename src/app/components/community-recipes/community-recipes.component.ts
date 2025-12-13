import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/auth.service';
import { CustomRecipe, Favorite, Recipe } from '../../models/models';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';

@Component({
  selector: 'app-community-recipes',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  template: `
    <div class="community-container">
      <div class="page-header">
        <h1>🌍 Community Recipes</h1>
        <p>Discover unique recipes created by our community members</p>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading community recipes...</p>
      </div>

      <div *ngIf="!loading && recipes.length === 0" class="empty-state">
        <p>No public recipes found yet.</p>
        <p>Be the first to share one!</p>
        <button (click)="goToCreateRecipe()" class="btn-primary">
          Share Your Recipe
        </button>
      </div>

      <div class="recipes-grid" *ngIf="recipes.length > 0 && !loading">
        <app-recipe-card 
          *ngFor="let recipe of recipes"
          [recipe]="recipeAsStandard(recipe)"
          [isFavorite]="isFavorite(recipe.id)"
          [showFavorite]="true"
          (favoriteToggle)="toggleFavorite($event)"
        ></app-recipe-card>
      </div>
    </div>
  `,
  styles: [`
    .community-container {
      padding: 2rem 0;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .loading {
      text-align: center;
      padding: 4rem;
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

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: #f8f9fa;
      border-radius: 12px;
      margin-top: 2rem;
    }

    .empty-state p {
      font-size: 1.2rem;
      color: #7f8c8d;
      margin-bottom: 1rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
      margin-top: 1rem;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
    }

    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
      padding: 0 1rem;
    }
  `]
})
export class CommunityRecipesComponent implements OnInit {
  recipes: CustomRecipe[] = [];
  favorites: Favorite[] = [];
  loading: boolean = true;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  constructor(
    private userDataService: UserDataService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadRecipes();
    if (this.isLoggedIn) {
      this.loadFavorites();
    } else {
      this.loadGuestFavorites();
    }
  }

  loadRecipes(): void {
    this.loading = true;
    this.userDataService.getPublicCustomRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading community recipes:', err);
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
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadGuestFavorites(): void {
    this.favorites = this.userDataService['getGuestFavorites']();
    this.cdr.detectChanges();
  }

  isFavorite(recipeId?: string | number): boolean {
    if (!recipeId) return false;
    return this.favorites.some(fav => fav.recipeId === recipeId);
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
      this.userDataService.removeFavorite(existingFavorite.id as number).subscribe({
        next: () => {
          this.favorites = this.favorites.filter(fav => fav.id !== existingFavorite.id);
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  recipeAsStandard(custom: CustomRecipe): Recipe {
    // Map CustomRecipe to Recipe format for the card
    return {
      id: custom.id || 0, // Fallback, though id custom recipes should have IDs handled
      title: custom.title,
      image: custom.image,
      summary: custom.ingredients, // using ingredients as summary preview
      readyInMinutes: 0, // Not captured for custom recipes yet
      servings: 0
    };
  }

  goToCreateRecipe(): void {
    this.router.navigate(['/custom-recipe']);
  }
}
