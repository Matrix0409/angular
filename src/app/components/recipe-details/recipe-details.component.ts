import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SpoonacularService } from '../../services/spoonacular.service';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/auth.service';
import { RecipeDetails, Review, Favorite } from '../../models/models';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="details-container" *ngIf="recipe && !loading">
      <!-- Recipe Header -->
      <div class="recipe-header">
        <div class="header-content">
          <h1>{{recipe.title}}</h1>
          <div class="recipe-meta">
            <span *ngIf="recipe.readyInMinutes">⏱️ {{recipe.readyInMinutes}} minutes</span>
            <span *ngIf="recipe.servings">🍽️ {{recipe.servings}} servings</span>
            <span *ngIf="recipe.diets && recipe.diets.length > 0">
              🥗 {{recipe.diets.join(', ')}}
            </span>
          </div>
          <div class="action-buttons">
            <button 
              *ngIf="isLoggedIn" 
              (click)="toggleFavorite()" 
              class="btn-favorite"
              [class.is-favorite]="isFavorite"
            >
              {{isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}}
            </button>
            <button (click)="shareRecipe()" class="btn-share">
              🔗 Share Recipe
            </button>
          </div>
        </div>
        <div class="header-image">
          <img [src]="recipe.image" [alt]="recipe.title" />
        </div>
      </div>

      <!-- Recipe Summary -->
      <div class="recipe-section" *ngIf="recipe.summary">
        <h2>About This Recipe</h2>
        <div [innerHTML]="recipe.summary" class="recipe-summary"></div>
      </div>

      <!-- Ingredients -->
      <div class="recipe-section" *ngIf="recipe.extendedIngredients && recipe.extendedIngredients.length > 0">
        <h2>📋 Ingredients</h2>
        <ul class="ingredients-list">
          <li *ngFor="let ingredient of recipe.extendedIngredients">
            {{ingredient.original}}
          </li>
        </ul>
      </div>

      <!-- Instructions -->
      <div class="recipe-section" *ngIf="recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0">
        <h2>👨‍🍳 Instructions</h2>
        <div *ngFor="let instruction of recipe.analyzedInstructions">
          <h3 *ngIf="instruction.name">{{instruction.name}}</h3>
          <ol class="instructions-list">
            <li *ngFor="let step of instruction.steps">
              <span class="step-number">{{step.number}}</span>
              <span class="step-text">{{step.step}}</span>
            </li>
          </ol>
        </div>
      </div>

      <!-- Nutrition -->
      <div class="recipe-section" *ngIf="recipe.nutrition && recipe.nutrition.nutrients">
        <h2>📊 Nutrition Facts</h2>
        <div class="nutrition-grid">
          <div class="nutrition-item" *ngFor="let nutrient of getMainNutrients()">
            <div class="nutrient-name">{{nutrient.name}}</div>
            <div class="nutrient-amount">{{nutrient.amount}}{{nutrient.unit}}</div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="recipe-section">
        <h2>⭐ Reviews ({{reviews.length}})</h2>
        
        <!-- Add Review Form -->
        <div class="add-review" *ngIf="isLoggedIn">
          <h3>Write a Review</h3>
          <div class="rating-input">
            <label>Rating:</label>
            <div class="stars">
              <span 
                *ngFor="let star of [1,2,3,4,5]" 
                (click)="setRating(star)"
                [class.selected]="star <= newReview.rating"
                class="star"
              >
                ⭐
              </span>
            </div>
          </div>
          <textarea 
            [(ngModel)]="newReview.comment" 
            placeholder="Share your thoughts about this recipe..."
            rows="4"
          ></textarea>
          <button (click)="submitReview()" class="btn-primary">
            Submit Review
          </button>
        </div>

        <div *ngIf="!isLoggedIn" class="login-prompt">
          <p>Please <a routerLink="/login">login</a> to write a review</p>
        </div>

        <!-- Reviews List -->
        <div class="reviews-list">
          <div class="review-item" *ngFor="let review of reviews">
            <div class="review-header">
              <div class="review-author">
                <strong>{{review.userName || 'Anonymous'}}</strong>
                <span class="review-rating">
                  <span *ngFor="let i of getRatingArray(review.rating)">⭐</span>
                </span>
              </div>
              <div class="review-date">{{formatDate(review.date)}}</div>
            </div>
            <p class="review-comment">{{review.comment}}</p>
          </div>

          <div *ngIf="reviews.length === 0" class="no-reviews">
            <p>No reviews yet. Be the first to review this recipe!</p>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading recipe details...</p>
    </div>

    <div *ngIf="error" class="error">
      {{error}}
    </div>
  `,
  styles: [`
    .details-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1rem;
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
    }

    .recipe-header {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }

    .header-content h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .recipe-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-favorite, .btn-share {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-favorite {
      background: #e0e0e0;
      color: #2c3e50;
    }

    .btn-favorite.is-favorite {
      background: #e74c3c;
      color: white;
    }

    .btn-share {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-favorite:hover, .btn-share:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .header-image img {
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .recipe-section {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .recipe-section h2 {
      font-size: 1.8rem;
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .recipe-summary {
      line-height: 1.8;
      color: #34495e;
    }

    .ingredients-list {
      list-style: none;
      padding: 0;
    }

    .ingredients-list li {
      padding: 0.75rem;
      border-bottom: 1px solid #e0e0e0;
      color: #2c3e50;
    }

    .ingredients-list li:last-child {
      border-bottom: none;
    }

    .instructions-list {
      list-style: none;
      padding: 0;
      counter-reset: step-counter;
    }

    .instructions-list li {
      display: flex;
      align-items: flex-start;
      padding: 1.5rem;
      margin-bottom: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .step-number {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 1rem;
      flex-shrink: 0;
    }

    .step-text {
      flex: 1;
      line-height: 1.6;
      color: #2c3e50;
    }

    .nutrition-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .nutrition-item {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }

    .nutrient-name {
      color: #7f8c8d;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .nutrient-amount {
      color: #2c3e50;
      font-size: 1.25rem;
      font-weight: bold;
    }

    .add-review {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .add-review h3 {
      margin-bottom: 1rem;
      color: #2c3e50;
    }

    .rating-input {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stars {
      display: flex;
      gap: 0.25rem;
    }

    .star {
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0.3;
      transition: opacity 0.2s;
    }

    .star.selected {
      opacity: 1;
    }

    .add-review textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-family: inherit;
      font-size: 1rem;
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
    }

    .login-prompt {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .login-prompt a {
      color: #667eea;
      font-weight: 600;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .review-item {
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .review-author {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .review-rating {
      font-size: 0.875rem;
    }

    .review-date {
      color: #7f8c8d;
      font-size: 0.875rem;
    }

    .review-comment {
      color: #2c3e50;
      line-height: 1.6;
      margin: 0;
    }

    .no-reviews {
      text-align: center;
      padding: 2rem;
      color: #7f8c8d;
    }

    @media (max-width: 768px) {
      .recipe-header {
        grid-template-columns: 1fr;
      }

      .header-content h1 {
        font-size: 1.8rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-favorite, .btn-share {
        width: 100%;
      }
    }
  `]
})
export class RecipeDetailsComponent implements OnInit {
  recipe: RecipeDetails | null = null;
  reviews: Review[] = [];
  isFavorite: boolean = false;
  loading: boolean = true;
  error: string = '';

  newReview = {
    rating: 0,
    comment: ''
  };

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
    this.route.params.subscribe(params => {
      const idParam = params['id'];
      if (idParam) {
        // Check if ID is likely a Spoonacular ID (numeric) or Custom ID (string)
        // Note: Custom IDs generated by UUID are strings. Spoonacular IDs are numbers.
        const numericId = Number(idParam);
        const isNumeric = !isNaN(numericId);

        if (isNumeric) {
          this.loadRecipe(numericId);
          this.loadReviews(numericId);
          if (this.isLoggedIn) {
            this.checkFavorite(numericId);
          }
        } else {
          // It's a custom recipe string ID
          this.loadCustomRecipe(idParam);
          this.loadReviews(idParam); // loadReviews already supports string | number
          if (this.isLoggedIn) {
            // checkFavorite/removeFavorite/etc need updates if they don't support strings yet in this file
            // checkFavorite signature in this file is (recipeId: number), needs update.
            this.checkFavorite(idParam);
          }
        }
      }
    });
  }

  loadRecipe(id: number): void {
    console.log('RecipeDetails: loadRecipe called with id:', id);
    this.loading = true;
    this.spoonacularService.getRecipeDetails(id).subscribe({
      next: (recipe) => {
        console.log('RecipeDetails: received recipe', recipe);
        this.recipe = recipe;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('RecipeDetails: Error loading recipe:', err);
        if (err.status === 402) {
          this.error = 'API limit reached. Please check your Spoonacular API key.';
        } else {
          this.error = `Failed to load recipe details: ${err.statusText || 'Unknown error'}`;
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCustomRecipe(id: string): void {
    this.loading = true;
    this.userDataService.getCustomRecipeById(id).subscribe({
      next: (customRecipe) => {
        this.recipe = this.mapCustomToDetails(customRecipe);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading custom recipe:', err);
        this.error = 'Failed to load custom recipe.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  mapCustomToDetails(custom: any): RecipeDetails {
    // Basic mapping, handling the raw string ingredients/instructions
    // by wrapping them into the expected arrays.
    return {
      id: custom.id,
      title: custom.title,
      image: custom.image,
      summary: custom.ingredients, // fallback
      readyInMinutes: 0,
      servings: 0,
      extendedIngredients: [
        {
          id: 0,
          name: 'Ingredients',
          amount: 0,
          unit: '',
          original: custom.ingredients || ''
        }
      ],
      analyzedInstructions: [
        {
          name: '',
          steps: [
            {
              number: 1,
              step: custom.instructions || '',
              ingredients: [],
              equipment: []
            }
          ]
        }
      ]
    };
  }

  loadReviews(recipeId: number | string): void {
    this.userDataService.getReviewsByRecipeId(recipeId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
      }
    });
  }

  checkFavorite(recipeId: number | string): void {
    const userId = this.authService.currentUserValue?.id;
    if (userId) {
      this.userDataService.checkIfFavorite(userId, recipeId).subscribe({
        next: (favorites) => {
          this.isFavorite = favorites.length > 0;
        },
        error: (err) => {
          console.error('Error checking favorite:', err);
        }
      });
    }
  }

  toggleFavorite(): void {
    if (!this.recipe || !this.isLoggedIn) return;

    const userId = this.authService.currentUserValue?.id;
    if (!userId) return;

    if (this.isFavorite) {
      // Remove from favorites
      this.userDataService.checkIfFavorite(userId, this.recipe.id).subscribe({
        next: (favorites) => {
          if (favorites.length > 0 && favorites[0].id) {
            // favorites[0].id should be string | number inside Favorite model, check removal
            // removeFavorite expects number | string now (updated previously)
            this.userDataService.removeFavorite(favorites[0].id).subscribe({
              next: () => {
                this.isFavorite = false;
                this.cdr.detectChanges();
              }
            });
          }
        }
      });
    } else {
      // Add to favorites
      const favorite: Favorite = {
        userId: userId,
        recipeId: this.recipe.id,
        title: this.recipe.title,
        image: this.recipe.image
      };

      this.userDataService.addFavorite(favorite).subscribe({
        next: () => {
          this.isFavorite = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error adding favorite:', err);
          alert('Failed to add favorite');
        }
      });
    }
  }

  shareRecipe(): void {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.recipe?.title || 'Recipe',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Recipe link copied to clipboard!');
    }
  }

  getMainNutrients() {
    if (!this.recipe?.nutrition?.nutrients) return [];
    const mainNutrients = ['Calories', 'Fat', 'Carbohydrates', 'Protein', 'Sugar', 'Sodium'];
    return this.recipe.nutrition.nutrients.filter(n => mainNutrients.includes(n.name));
  }

  setRating(rating: number): void {
    this.newReview.rating = rating;
  }

  submitReview(): void {
    if (!this.recipe || !this.isLoggedIn) return;

    if (this.newReview.rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!this.newReview.comment.trim()) {
      alert('Please write a comment');
      return;
    }

    const userId = this.authService.currentUserValue?.id;
    const userName = this.authService.currentUserValue?.name;
    if (!userId) return;

    const review: Review = {
      recipeId: this.recipe.id,
      userId: userId,
      userName: userName,
      rating: this.newReview.rating,
      comment: this.newReview.comment,
      date: new Date().toISOString()
    };

    this.userDataService.addReview(review).subscribe({
      next: (newReview) => {
        this.reviews.unshift(newReview);
        this.newReview = { rating: 0, comment: '' };
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        alert('Failed to submit review');
      }
    });
  }

  getRatingArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}