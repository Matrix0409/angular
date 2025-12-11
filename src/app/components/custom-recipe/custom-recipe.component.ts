import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserDataService } from '../../services/user-data.service';
import { AuthService } from '../../services/auth.service';
import { CustomRecipe } from '../../models/models';

@Component({
  selector: 'app-custom-recipe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="custom-recipe-container">
      <h1>📝 Add Your Custom Recipe</h1>
      <p class="subtitle">Share your favorite recipe with the community</p>

      <div class="recipe-form-card">
        <form [formGroup]="recipeForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="title">Recipe Title *</label>
            <input 
              id="title"
              type="text" 
              formControlName="title"
              placeholder="e.g., Grandma's Chocolate Chip Cookies"
              [class.invalid]="recipeForm.get('title')?.invalid && recipeForm.get('title')?.touched"
            />
            <div class="error-message" *ngIf="recipeForm.get('title')?.invalid && recipeForm.get('title')?.touched">
              Recipe title is required
            </div>
          </div>

          <div class="form-group">
            <label for="ingredients">Ingredients *</label>
            <textarea 
              id="ingredients"
              formControlName="ingredients"
              rows="6"
              placeholder="List your ingredients (one per line or comma-separated)&#10;&#10;Example:&#10;2 cups all-purpose flour&#10;1 cup sugar&#10;2 eggs&#10;1 tsp vanilla extract"
              [class.invalid]="recipeForm.get('ingredients')?.invalid && recipeForm.get('ingredients')?.touched"
            ></textarea>
            <div class="error-message" *ngIf="recipeForm.get('ingredients')?.invalid && recipeForm.get('ingredients')?.touched">
              Ingredients are required
            </div>
          </div>

          <div class="form-group">
            <label for="instructions">Cooking Instructions *</label>
            <textarea 
              id="instructions"
              formControlName="instructions"
              rows="8"
              placeholder="Provide step-by-step instructions&#10;&#10;Example:&#10;1. Preheat oven to 350°F (175°C)&#10;2. Mix flour and sugar in a large bowl&#10;3. Add eggs and vanilla, mix well&#10;4. Bake for 15-20 minutes"
              [class.invalid]="recipeForm.get('instructions')?.invalid && recipeForm.get('instructions')?.touched"
            ></textarea>
            <div class="error-message" *ngIf="recipeForm.get('instructions')?.invalid && recipeForm.get('instructions')?.touched">
              Instructions are required
            </div>
          </div>

          <div class="form-group">
            <label for="image">Image URL (Optional)</label>
            <input 
              id="image"
              type="url" 
              formControlName="image"
              placeholder="https://example.com/image.jpg"
            />
            <small>Provide a URL to an image of your recipe, or leave blank for a placeholder</small>
          </div>

          <div class="form-checkbox">
            <label class="checkbox-container">
              <input type="checkbox" formControlName="isPublic">
              <span class="checkmark"></span>
              Make this recipe Public
            </label>
            <small class="checkbox-help">Public recipes appear in the Community section and can be seen by other users.</small>
          </div>

          <div class="image-preview" *ngIf="recipeForm.get('image')?.value">
            <p>Image Preview:</p>
            <img [src]="recipeForm.get('image')?.value" alt="Recipe preview" (error)="onImageError()">
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="recipeForm.invalid || submitting">
              {{submitting ? 'Saving...' : '💾 Save Recipe'}}
            </button>
            <button type="button" (click)="resetForm()" class="btn-secondary">
              🔄 Clear Form
            </button>
          </div>

          <div *ngIf="errorMessage" class="error-message-box">
            {{errorMessage}}
          </div>

          <div *ngIf="successMessage" class="success-message-box">
            {{successMessage}}
          </div>
        </form>
      </div>

      <div class="tips-section">
        <h2>💡 Tips for Adding Recipes</h2>
        <div class="tips-grid">
          <div class="tip-card">
            <div class="tip-icon">📋</div>
            <h3>Be Specific</h3>
            <p>Include exact measurements and cooking times for best results</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">📸</div>
            <h3>Add Photos</h3>
            <p>A good photo makes your recipe more appealing to others</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">✍️</div>
            <h3>Clear Instructions</h3>
            <p>Break down steps clearly so anyone can follow along</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">🌟</div>
            <h3>Share Tips</h3>
            <p>Include helpful cooking tips or substitution suggestions</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-recipe-container {
      max-width: 900px;
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

    .recipe-form-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 3rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-checkbox {
      margin-bottom: 2rem;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 1.05rem;
      color: #2c3e50;
      font-weight: 600;
    }

    .checkbox-container input {
      width: 1.2rem;
      height: 1.2rem;
      cursor: pointer;
    }

    .checkbox-help {
      display: block;
      color: #7f8c8d;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      margin-left: 1.7rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 1.05rem;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.3s;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group input.invalid,
    .form-group textarea.invalid {
      border-color: #e74c3c;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-group small {
      display: block;
      color: #7f8c8d;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .image-preview {
      margin-bottom: 1.5rem;
    }

    .image-preview p {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .image-preview img {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .form-actions {
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

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
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

    .error-message-box {
      background: #ffe5e5;
      color: #e74c3c;
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1rem;
      text-align: center;
    }

    .success-message-box {
      background: #d4edda;
      color: #27ae60;
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1rem;
      text-align: center;
      font-weight: 600;
    }

    .tips-section {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .tips-section h2 {
      font-size: 1.8rem;
      color: #2c3e50;
      margin-bottom: 2rem;
      text-align: center;
    }

    .tips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .tip-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }

    .tip-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .tip-card h3 {
      font-size: 1.1rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .tip-card p {
      color: #7f8c8d;
      font-size: 0.9rem;
      line-height: 1.6;
      margin: 0;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.8rem;
      }

      .recipe-form-card,
      .tips-section {
        padding: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .tips-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CustomRecipeComponent implements OnInit {
  recipeForm: FormGroup;
  submitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private userDataService: UserDataService,
    private authService: AuthService,
    private router: Router
  ) {
    this.recipeForm = this.formBuilder.group({
      title: ['', Validators.required],
      ingredients: ['', Validators.required],
      instructions: ['', Validators.required],
      image: [''],
      isPublic: [false]
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.recipeForm.invalid) {
      Object.keys(this.recipeForm.controls).forEach(key => {
        this.recipeForm.get(key)?.markAsTouched();
      });
      return;
    }

    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      this.errorMessage = 'You must be logged in to add recipes';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const customRecipe: CustomRecipe = {
      userId: userId,
      title: this.recipeForm.value.title,
      ingredients: this.recipeForm.value.ingredients,
      instructions: this.recipeForm.value.instructions,
      image: this.recipeForm.value.image || 'https://placehold.co/312x231/eee/ccc?text=My+Recipe',
      isPublic: this.recipeForm.value.isPublic
    };

    this.userDataService.addCustomRecipe(customRecipe).subscribe({
      next: (recipe) => {
        this.successMessage = 'Recipe added successfully! Redirecting to your profile...';
        this.submitting = false;

        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error adding recipe:', err);
        this.errorMessage = 'Failed to add recipe. Please try again.';
        this.submitting = false;
      }
    });
  }

  resetForm(): void {
    this.recipeForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  onImageError(): void {
    this.recipeForm.patchValue({
      image: ''
    });
    this.errorMessage = 'Invalid image URL. Please check the URL and try again.';
  }
}