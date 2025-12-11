import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDataService } from '../services/user-data.service';
import { Review } from '../models/models';

@Component({
  selector: 'app-review-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="review-management">
      <div class="page-header">
        <h1>💬 Review Management</h1>
        <p>Moderate and manage user-submitted reviews</p>
      </div>

      <div class="management-card">
        <div class="card-header">
          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (input)="filterReviews()"
              placeholder="🔍 Search reviews by user or comment..."
            />
          </div>
          <div class="filter-buttons">
            <button 
              [class.active]="filterRating === null"
              (click)="setFilterRating(null)"
              class="filter-btn"
            >
              All ({{reviews.length}})
            </button>
            <button 
              *ngFor="let rating of [5,4,3,2,1]"
              [class.active]="filterRating === rating"
              (click)="setFilterRating(rating)"
              class="filter-btn"
            >
              {{rating}}⭐ ({{getCountByRating(rating)}})
            </button>
          </div>
        </div>

        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading reviews...</p>
        </div>

        <div *ngIf="!loading && filteredReviews.length === 0" class="no-reviews">
          <p>No reviews found</p>
        </div>

        <div class="reviews-list" *ngIf="!loading && filteredReviews.length > 0">
          <div class="review-card" *ngFor="let review of filteredReviews">
            <div class="review-header">
              <div class="review-user">
                <div class="user-avatar">
                  {{review.userName ? review.userName.charAt(0).toUpperCase() : '?'}}
                </div>
                <div class="user-info">
                  <strong>{{review.userName || 'Anonymous User'}}</strong>
                  <span class="user-id">User ID: {{review.userId}}</span>
                </div>
              </div>
              <div class="review-rating">
                <span *ngFor="let star of getRatingArray(review.rating)" class="star">⭐</span>
                <span class="rating-value">{{review.rating}}/5</span>
              </div>
            </div>

            <div class="review-body">
              <div class="review-meta">
                <span class="recipe-id">Recipe ID: #{{review.recipeId}}</span>
                <span class="review-date">{{formatDate(review.date)}}</span>
              </div>
              <p class="review-comment">{{review.comment}}</p>
            </div>

            <div class="review-actions">
              <button (click)="viewRecipe(review.recipeId)" class="btn-view">
                👁️ View Recipe
              </button>
              <button (click)="confirmDelete(review)" class="btn-delete">
                🗑️ Delete Review
              </button>
            </div>
          </div>
        </div>

        <div class="pagination" *ngIf="!loading && totalPages > 1">
          <button 
            (click)="previousPage()" 
            [disabled]="currentPage === 1"
            class="btn-page"
          >
            ← Previous
          </button>
          <span class="page-info">
            Page {{currentPage}} of {{totalPages}}
          </span>
          <button 
            (click)="nextPage()" 
            [disabled]="currentPage === totalPages"
            class="btn-page"
          >
            Next →
          </button>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal" *ngIf="showDeleteModal" (click)="cancelDelete()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>⚠️ Delete Review</h2>
          <p>Are you sure you want to delete this review?</p>
          <div class="review-preview">
            <div class="preview-rating">
              <span *ngFor="let star of getRatingArray(reviewToDelete?.rating || 0)">⭐</span>
            </div>
            <p>"{{reviewToDelete?.comment}}"</p>
            <small>by {{reviewToDelete?.userName || 'Anonymous'}}</small>
          </div>
          <p class="warning-text">This action cannot be undone.</p>
          <div class="modal-actions">
            <button (click)="deleteReview()" class="btn-confirm" [disabled]="deleting">
              {{deleting ? 'Deleting...' : '🗑️ Yes, Delete'}}
            </button>
            <button (click)="cancelDelete()" class="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="successMessage" class="success-toast">
        ✅ {{successMessage}}
      </div>

      <div *ngIf="errorMessage" class="error-toast">
        ❌ {{errorMessage}}
      </div>
    </div>
  `,
  styles: [`
    .review-management {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      font-size: 1.1rem;
      color: #7f8c8d;
    }

    .management-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .card-header {
      padding: 2rem;
      border-bottom: 2px solid #e0e0e0;
    }

    .search-box {
      margin-bottom: 1.5rem;
    }

    .search-box input {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .search-box input:focus {
      outline: none;
      border-color: #667eea;
    }

    .filter-buttons {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.625rem 1.25rem;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      color: #7f8c8d;
      cursor: pointer;
      transition: all 0.3s;
    }

    .filter-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }

    .filter-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
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

    .no-reviews {
      text-align: center;
      padding: 4rem;
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .reviews-list {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .review-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .review-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .review-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.2rem;
    }

    .user-info strong {
      display: block;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .user-id {
      font-size: 0.875rem;
      color: #7f8c8d;
    }

    .review-rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .star {
      font-size: 1.2rem;
    }

    .rating-value {
      font-weight: 600;
      color: #2c3e50;
    }

    .review-body {
      margin-bottom: 1rem;
    }

    .review-meta {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      color: #7f8c8d;
    }

    .recipe-id {
      font-weight: 600;
    }

    .review-comment {
      color: #2c3e50;
      line-height: 1.6;
      margin: 0;
      padding: 1rem;
      background: white;
      border-radius: 8px;
    }

    .review-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-view, .btn-delete {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-view {
      background: #3498db;
      color: white;
    }

    .btn-view:hover {
      background: #2980b9;
    }

    .btn-delete {
      background: #e74c3c;
      color: white;
    }

    .btn-delete:hover {
      background: #c0392b;
    }

    .pagination {
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2rem;
    }

    .btn-page {
      padding: 0.75rem 1.5rem;
      border: 2px solid #667eea;
      background: white;
      color: #667eea;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-page:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      font-weight: 600;
      color: #2c3e50;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .modal-content h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .modal-content p {
      color: #7f8c8d;
      margin-bottom: 1rem;
    }

    .review-preview {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .preview-rating {
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
    }

    .review-preview p {
      color: #2c3e50;
      font-style: italic;
      margin: 0.5rem 0;
    }

    .review-preview small {
      color: #7f8c8d;
    }

    .warning-text {
      color: #e74c3c;
      font-weight: 600;
      margin-top: 1rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .btn-confirm, .btn-cancel {
      flex: 1;
      padding: 0.875rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-confirm {
      background: #e74c3c;
      color: white;
    }

    .btn-confirm:hover:not(:disabled) {
      background: #c0392b;
    }

    .btn-confirm:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: #e0e0e0;
      color: #2c3e50;
    }

    .btn-cancel:hover {
      background: #bdc3c7;
    }

    .success-toast, .error-toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
      z-index: 1001;
    }

    .success-toast {
      background: #27ae60;
      color: white;
    }

    .error-toast {
      background: #e74c3c;
      color: white;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .review-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .review-actions {
        flex-direction: column;
      }

      .btn-view, .btn-delete {
        width: 100%;
      }

      .pagination {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class ReviewManagementComponent implements OnInit {
  reviews: Review[] = [];
  filteredReviews: Review[] = [];
  searchQuery: string = '';
  filterRating: number | null = null;
  loading: boolean = true;
  deleting: boolean = false;

  showDeleteModal: boolean = false;
  reviewToDelete: Review | null = null;

  successMessage: string = '';
  errorMessage: string = '';

  currentPage: number = 1;
  reviewsPerPage: number = 10;
  totalPages: number = 1;

  constructor(private userDataService: UserDataService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.userDataService.getAllReviews().subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews.sort((a: Review, b: Review) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.filterReviews();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading reviews:', err);
        this.showError('Failed to load reviews');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterReviews(): void {
    let filtered = this.reviews;

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(review =>
        review.userName?.toLowerCase().includes(query) ||
        review.comment.toLowerCase().includes(query)
      );
    }

    // Filter by rating
    if (this.filterRating !== null) {
      filtered = filtered.filter(review => review.rating === this.filterRating);
    }

    this.filteredReviews = filtered;
    this.totalPages = Math.ceil(this.filteredReviews.length / this.reviewsPerPage);
    this.currentPage = 1;
  }

  setFilterRating(rating: number | null): void {
    this.filterRating = rating;
    this.filterReviews();
  }

  getCountByRating(rating: number): number {
    return this.reviews.filter(r => r.rating === rating).length;
  }

  getRatingArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  viewRecipe(recipeId: number): void {
    window.open(`/recipes/${recipeId}`, '_blank');
  }

  confirmDelete(review: Review): void {
    this.reviewToDelete = review;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.reviewToDelete = null;
  }

  deleteReview(): void {
    if (!this.reviewToDelete?.id) return;

    this.deleting = true;
    this.userDataService.deleteReview(this.reviewToDelete.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== this.reviewToDelete?.id);
        this.filterReviews();
        this.showSuccess('Review deleted successfully');
        this.showDeleteModal = false;
        this.reviewToDelete = null;
        this.deleting = false;
      },
      error: (err: any) => {
        console.error('Error deleting review:', err);
        this.showError('Failed to delete review');
        this.deleting = false;
      }
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }
}