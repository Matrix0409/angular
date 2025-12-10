import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Recipe } from '../../models/models';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="recipe-card" (click)="viewRecipe()">
      <div class="recipe-image">
        <img [src]="recipe.image" [alt]="recipe.title" />
        <div class="recipe-overlay">
          <button class="btn-favorite" (click)="onFavoriteClick($event)" *ngIf="showFavorite">
            {{isFavorite ? '❤️' : '🤍'}}
          </button>
        </div>
      </div>
      
      <div class="recipe-content">
        <h3 class="recipe-title">{{recipe.title}}</h3>
        
        <div class="recipe-meta" *ngIf="recipe.readyInMinutes || recipe.servings">
          <span *ngIf="recipe.readyInMinutes" class="meta-item">
            ⏱️ {{recipe.readyInMinutes}} mins
          </span>
          <span *ngIf="recipe.servings" class="meta-item">
            🍽️ {{recipe.servings}} servings
          </span>
        </div>
        
        <div class="recipe-actions">
          <button class="btn-view" (click)="viewRecipe()">
            View Recipe
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recipe-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .recipe-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .recipe-image {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
    }

    .recipe-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .recipe-card:hover .recipe-image img {
      transform: scale(1.05);
    }

    .recipe-overlay {
      position: absolute;
      top: 0;
      right: 0;
      padding: 0.5rem;
    }

    .btn-favorite {
      background: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .btn-favorite:hover {
      transform: scale(1.1);
    }

    .recipe-content {
      padding: 1.25rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .recipe-title {
      font-size: 1.1rem;
      color: #2c3e50;
      margin: 0 0 0.75rem 0;
      line-height: 1.4;
      min-height: 2.8rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .recipe-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .meta-item {
      color: #7f8c8d;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .recipe-actions {
      margin-top: auto;
    }

    .btn-view {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-view:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    @media (max-width: 768px) {
      .recipe-title {
        font-size: 1rem;
      }
    }
  `]
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Input() isFavorite: boolean = false;
  @Input() showFavorite: boolean = true;
  @Output() favoriteToggle = new EventEmitter<Recipe>();

  constructor(private router: Router) {}

  viewRecipe(): void {
    this.router.navigate(['/recipes', this.recipe.id]);
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoriteToggle.emit(this.recipe);
  }
}