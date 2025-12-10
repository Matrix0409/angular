import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDataService } from '../../../services/user-data.service';
import { User, Favorite, MealPlan, Review, CustomRecipe } from '../../../models/models';

interface RecipeStats {
  recipeId: number;
  title: string;
  count: number;
  averageRating?: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-dashboard">
      <div class="page-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Insights and statistics about your platform</p>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading analytics data...</p>
      </div>

      <div *ngIf="!loading">
        <!-- Overview Stats -->
        <div class="stats-section">
          <h2>📈 Platform Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <div class="stat-value">{{analytics.totalUsers}}</div>
                <div class="stat-label">Total Users</div>
                <div class="stat-detail">{{adminCount}} Admins, {{regularUserCount}} Regular</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">❤️</div>
              <div class="stat-info">
                <div class="stat-value">{{analytics.totalFavorites}}</div>
                <div class="stat-label">Total Favorites</div>
                <div class="stat-detail">Avg {{avgFavoritesPerUser}} per user</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-info">
                <div class="stat-value">{{analytics.totalMealPlans}}</div>
                <div class="stat-label">Meal Plans Created</div>
                <div class="stat-detail">Avg {{avgMealPlansPerUser}} per user</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-info">
                <div class="stat-value">{{analytics.totalReviews}}</div>
                <div class="stat-label">Total Reviews</div>
                <div class="stat-detail">Avg rating: {{averageRating}}/5</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-info">
                <div class="stat-value">{{analytics.totalCustomRecipes}}</div>
                <div class="stat-label">Custom Recipes</div>
                <div class="stat-detail">User-created content</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🍳</div>
              <div class="stat-info">
                <div class="stat-value">{{uniqueRecipes}}</div>
                <div class="stat-label">Unique Recipes</div>
                <div class="stat-detail">From all favorites</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Most Favorited Recipes -->
        <div class="insights-section">
          <h2>⭐ Most Popular Recipes</h2>
          <div class="insights-grid">
            <div class="insight-card">
              <h3>❤️ Most Favorited</h3>
              <div class="ranking-list">
                <div class="ranking-item" *ngFor="let recipe of mostFavorited; let i = index">
                  <span class="rank">{{i + 1}}</span>
                  <div class="recipe-info">
                    <strong>{{recipe.title}}</strong>
                    <span class="count">{{recipe.count}} favorites</span>
                  </div>
                </div>
                <div *ngIf="mostFavorited.length === 0" class="no-data">
                  No favorites yet
                </div>
              </div>
            </div>

            <div class="insight-card">
              <h3>💬 Most Reviewed</h3>
              <div class="ranking-list">
                <div class="ranking-item" *ngFor="let recipe of mostReviewed; let i = index">
                  <span class="rank">{{i + 1}}</span>
                  <div class="recipe-info">
                    <strong>Recipe #{{recipe.recipeId}}</strong>
                    <span class="count">{{recipe.count}} reviews</span>
                  </div>
                </div>
                <div *ngIf="mostReviewed.length === 0" class="no-data">
                  No reviews yet
                </div>
              </div>
            </div>

            <div class="insight-card">
              <h3>🌟 Highest Rated</h3>
              <div class="ranking-list">
                <div class="ranking-item" *ngFor="let recipe of highestRated; let i = index">
                  <span class="rank">{{i + 1}}</span>
                  <div class="recipe-info">
                    <strong>Recipe #{{recipe.recipeId}}</strong>
                    <span class="rating">⭐ {{recipe.averageRating?.toFixed(1)}} ({{recipe.count}} reviews)</span>
                  </div>
                </div>
                <div *ngIf="highestRated.length === 0" class="no-data">
                  No ratings yet
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Engagement -->
        <div class="engagement-section">
          <h2>👥 User Engagement</h2>
          <div class="engagement-grid">
            <div class="engagement-card">
              <h3>Most Active Users</h3>
              <div class="user-list">
                <div class="user-item" *ngFor="let user of topUsers">
                  <div class="user-avatar">{{user.name.charAt(0).toUpperCase()}}</div>
                  <div class="user-details">
                    <strong>{{user.name}}</strong>
                    <div class="user-stats">
                      <span>{{user.favoriteCount}} favorites</span>
                      <span>{{user.reviewCount}} reviews</span>
                      <span>{{user.mealPlanCount}} plans</span>
                    </div>
                  </div>
                </div>
                <div *ngIf="topUsers.length === 0" class="no-data">
                  No user activity yet
                </div>
              </div>
            </div>

            <div class="engagement-card">
              <h3>Rating Distribution</h3>
              <div class="rating-bars">
                <div class="rating-bar" *ngFor="let rating of [5,4,3,2,1]">
                  <span class="rating-label">{{rating}}⭐</span>
                  <div class="bar-container">
                    <div 
                      class="bar-fill" 
                      [style.width.%]="getRatingPercentage(rating)"
                    ></div>
                  </div>
                  <span class="rating-count">{{getRatingCount(rating)}}</span>
                </div>
                <div *ngIf="reviews.length === 0" class="no-data">
                  No ratings yet
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Insights -->
        <div class="additional-insights">
          <div class="insight-box">
            <div class="insight-icon">📊</div>
            <div class="insight-content">
              <h4>Engagement Rate</h4>
              <p class="insight-value">{{engagementRate}}%</p>
              <p class="insight-description">
                Users with at least one favorite or review
              </p>
            </div>
          </div>

          <div class="insight-box">
            <div class="insight-icon">🎯</div>
            <div class="insight-content">
              <h4>Content Creation</h4>
              <p class="insight-value">{{contentCreationRate}}%</p>
              <p class="insight-description">
                Users who added custom recipes
              </p>
            </div>
          </div>

          <div class="insight-box">
            <div class="insight-icon">📈</div>
            <div class="insight-content">
              <h4>Active Planners</h4>
              <p class="insight-value">{{plannerRate}}%</p>
              <p class="insight-description">
                Users who created meal plans
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
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
      font-size: 1.1rem;
      color: #7f8c8d;
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

    .stats-section,
    .insights-section,
    .engagement-section {
      margin-bottom: 3rem;
    }

    h2 {
      font-size: 2rem;
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .stat-icon {
      font-size: 3rem;
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #2c3e50;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .stat-detail {
      color: #95a5a6;
      font-size: 0.875rem;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .insight-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .insight-card h3 {
      font-size: 1.3rem;
      color: #2c3e50;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e0e0e0;
    }

    .ranking-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ranking-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .rank {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .recipe-info {
      flex: 1;
    }

    .recipe-info strong {
      display: block;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    .count, .rating {
      font-size: 0.875rem;
      color: #7f8c8d;
    }

    .no-data {
      text-align: center;
      padding: 2rem;
      color: #7f8c8d;
    }

    .engagement-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .engagement-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .engagement-card h3 {
      font-size: 1.3rem;
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .user-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .user-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
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
      flex-shrink: 0;
    }

    .user-details strong {
      display: block;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .user-stats {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .user-stats span {
      font-size: 0.875rem;
      color: #7f8c8d;
    }

    .rating-bars {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .rating-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .rating-label {
      min-width: 50px;
      font-weight: 600;
      color: #2c3e50;
    }

    .bar-container {
      flex: 1;
      height: 30px;
      background: #e0e0e0;
      border-radius: 15px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: width 0.5s ease;
    }

    .rating-count {
      min-width: 40px;
      text-align: right;
      font-weight: 600;
      color: #7f8c8d;
    }

    .additional-insights {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .insight-box {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      gap: 1.5rem;
    }

    .insight-icon {
      font-size: 3rem;
    }

    .insight-content h4 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .insight-value {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
      margin: 0.5rem 0;
    }

    .insight-description {
      color: #7f8c8d;
      font-size: 0.9rem;
      margin: 0;
    }

    @media (max-width: 768px) {
      .page-header h1 {
        font-size: 1.8rem;
      }

      .stats-grid,
      .insights-grid,
      .engagement-grid,
      .additional-insights {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  analytics = {
    totalUsers: 0,
    totalFavorites: 0,
    totalMealPlans: 0,
    totalReviews: 0,
    totalCustomRecipes: 0
  };

  users: User[] = [];
  favorites: Favorite[] = [];
  mealPlans: MealPlan[] = [];
  reviews: Review[] = [];
  customRecipes: CustomRecipe[] = [];

  mostFavorited: RecipeStats[] = [];
  mostReviewed: RecipeStats[] = [];
  highestRated: RecipeStats[] = [];
  topUsers: any[] = [];

  loading: boolean = true;

  get adminCount(): number {
    return this.users.filter(u => u.isAdmin).length;
  }

  get regularUserCount(): number {
    return this.users.filter(u => !u.isAdmin).length;
  }

  get avgFavoritesPerUser(): string {
    if (this.users.length === 0) return '0';
    return (this.analytics.totalFavorites / this.users.length).toFixed(1);
  }

  get avgMealPlansPerUser(): string {
    if (this.users.length === 0) return '0';
    return (this.analytics.totalMealPlans / this.users.length).toFixed(1);
  }

  get averageRating(): string {
    if (this.reviews.length === 0) return '0.0';
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  get uniqueRecipes(): number {
    const recipeIds = new Set(this.favorites.map(f => f.recipeId));
    return recipeIds.size;
  }

  get engagementRate(): string {
    if (this.users.length === 0) return '0';
    const engagedUsers = new Set([
      ...this.favorites.map(f => f.userId),
      ...this.reviews.map(r => r.userId)
    ]).size;
    return ((engagedUsers / this.users.length) * 100).toFixed(1);
  }

  get contentCreationRate(): string {
    if (this.users.length === 0) return '0';
    const creators = new Set(this.customRecipes.map(r => r.userId)).size;
    return ((creators / this.users.length) * 100).toFixed(1);
  }

  get plannerRate(): string {
    if (this.users.length === 0) return '0';
    const planners = new Set(this.mealPlans.map(p => p.userId)).size;
    return ((planners / this.users.length) * 100).toFixed(1);
  }

  constructor(private userDataService: UserDataService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;

    this.userDataService.getAllUsers().subscribe(users => {
      this.users = users;
      this.analytics.totalUsers = users.length;
    });

    this.userDataService.getAllFavorites().subscribe(favorites => {
      this.favorites = favorites;
      this.analytics.totalFavorites = favorites.length;
      this.calculateMostFavorited();
      this.calculateTopUsers();
    });

    this.userDataService.getAllMealPlans().subscribe(plans => {
      this.mealPlans = plans;
      this.analytics.totalMealPlans = plans.length;
      this.calculateTopUsers();
    });

    this.userDataService.getAllReviews().subscribe(reviews => {
      this.reviews = reviews;
      this.analytics.totalReviews = reviews.length;
      this.calculateMostReviewed();
      this.calculateHighestRated();
      this.calculateTopUsers();
      this.loading = false;
    });

    this.userDataService.getAllCustomRecipes().subscribe(recipes => {
      this.customRecipes = recipes;
      this.analytics.totalCustomRecipes = recipes.length;
    });
  }

  calculateMostFavorited(): void {
    const recipeCount = new Map<number, { title: string; count: number }>();
    
    this.favorites.forEach(fav => {
      const existing = recipeCount.get(fav.recipeId);
      if (existing) {
        existing.count++;
      } else {
        recipeCount.set(fav.recipeId, { title: fav.title, count: 1 });
      }
    });

    this.mostFavorited = Array.from(recipeCount.entries())
      .map(([recipeId, data]) => ({ recipeId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  calculateMostReviewed(): void {
    const reviewCount = new Map<number, number>();
    
    this.reviews.forEach(review => {
      reviewCount.set(review.recipeId, (reviewCount.get(review.recipeId) || 0) + 1);
    });

    this.mostReviewed = Array.from(reviewCount.entries())
      .map(([recipeId, count]) => ({ recipeId, count, title: `Recipe ${recipeId}` }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  calculateHighestRated(): void {
    const recipeRatings = new Map<number, { total: number; count: number }>();
    
    this.reviews.forEach(review => {
      const existing = recipeRatings.get(review.recipeId);
      if (existing) {
        existing.total += review.rating;
        existing.count++;
      } else {
        recipeRatings.set(review.recipeId, { total: review.rating, count: 1 });
      }
    });

    this.highestRated = Array.from(recipeRatings.entries())
      .map(([recipeId, data]) => ({
        recipeId,
        count: data.count,
        averageRating: data.total / data.count,
        title: `Recipe ${recipeId}`
      }))
      .filter(r => r.count >= 2) // At least 2 reviews
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 5);
  }

  calculateTopUsers(): void {
    const userActivity = new Map<number, any>();

    this.users.forEach(user => {
      if (user.id) {
        userActivity.set(user.id, {
          name: user.name,
          favoriteCount: 0,
          reviewCount: 0,
          mealPlanCount: 0,
          total: 0
        });
      }
    });

    this.favorites.forEach(fav => {
      const activity = userActivity.get(fav.userId);
      if (activity) {
        activity.favoriteCount++;
        activity.total++;
      }
    });

    this.reviews.forEach(review => {
      const activity = userActivity.get(review.userId);
      if (activity) {
        activity.reviewCount++;
        activity.total++;
      }
    });

    this.mealPlans.forEach(plan => {
      const activity = userActivity.get(plan.userId);
      if (activity) {
        activity.mealPlanCount++;
        activity.total++;
      }
    });

    this.topUsers = Array.from(userActivity.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  getRatingPercentage(rating: number): number {
    if (this.reviews.length === 0) return 0;
    const count = this.reviews.filter(r => r.rating === rating).length;
    return (count / this.reviews.length) * 100;
  }

  getRatingCount(rating: number): number {
    return this.reviews.filter(r => r.rating === rating).length;
  }
}