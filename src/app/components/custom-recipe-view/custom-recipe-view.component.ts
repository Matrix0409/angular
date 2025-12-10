import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDataService } from '../../services/user-data.service';
import { CustomRecipe } from '../../models/models';

@Component({
  selector: 'app-custom-recipe-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-recipe-view" *ngIf="recipe && !loading">
      <div class="recipe-header">
        <img [src]="recipe.image" [alt]="recipe.title" />
        <div class="header-info">
          <h1>{{recipe.title}}</h1>
          <span class="badge">Custom Recipe</span>
        </div>
      </div>

      <div class="recipe-section">
        <h2>📋 Ingredients</h2>
        <div class="ingredients-content">
          {{recipe.ingredients}}
        </div>
      </div>

      <div class="recipe-section">
        <h2>👨‍🍳 Instructions</h2>
        <div class="instructions-content">
          {{recipe.instructions}}
        </div>
      </div>

      <button (click)="goBack()" class="btn-back">
        ← Back to Profile
      </button>
    </div>

    <div *ngIf="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading recipe...</p>
    </div>

    <div *ngIf="error" class="error">
      {{error}}
    </div>
  `,
  styles: [`
    .custom-recipe-view {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .recipe-header {
      margin-bottom: 2rem;
    }

    .recipe-header img {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .header-info h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin: 0;
    }

    .badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
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

    .ingredients-content,
    .instructions-content {
      color: #34495e;
      line-height: 1.8;
      white-space: pre-wrap;
      font-size: 1.1rem;
    }

    .btn-back {
      background: #667eea;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-back:hover {
      background: #5568d3;
      transform: translateY(-2px);
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

    .error {
      text-align: center;
      padding: 2rem;
      color: #e74c3c;
      background: #ffe5e5;
      border-radius: 8px;
    }
  `]
})
export class CustomRecipeViewComponent implements OnInit {
  recipe: CustomRecipe | null = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userDataService: UserDataService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      console.log('CustomRecipeView: route params', params);
      if (id) {
        this.loadCustomRecipe(id);
      } else {
        console.warn('CustomRecipeView: no id param found');
        this.error = 'No recipe id provided';
        this.loading = false;
      }
    });
  }

  loadCustomRecipe(id: string): void {
    console.log('CustomRecipeView: loadCustomRecipe called with id:', id);
    this.loading = true;
    this.userDataService.getCustomRecipeById(id).subscribe({
      next: (recipe) => {
        console.log('CustomRecipeView: received recipe', recipe);
        this.recipe = recipe;
        this.loading = false;
        console.log('CustomRecipeView: loading set to false, recipe:', !!this.recipe);
        this.cdr.detectChanges();
        console.log('CustomRecipeView: change detection triggered');
      },
      error: (err) => {
        console.error('CustomRecipeView: Error loading custom recipe:', err);
        this.error = `Failed to load recipe: ${err?.message || err}`;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}