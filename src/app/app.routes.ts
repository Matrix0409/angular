import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.components').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./components/recipe-search/recipe-search.component').then(m => m.RecipeSearchComponent)
  },
  {
    path: 'recipes/:id',
    loadComponent: () => import('./components/recipe-details/recipe-details.component').then(m => m.RecipeDetailsComponent)
  },

  // Admin Login
  {
    path: 'admin/login',
    loadComponent: () => import('./components/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },

  // Protected Routes
  {
    path: 'advanced-search',
    loadComponent: () => import('./components/advanced-search/advanced-search.components').then(m => m.AdvancedSearchComponent),
    canActivate: [() => import('./guards/auth-guard').then(m => m.AuthGuard)]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [() => import('./guards/auth-guard').then(m => m.AuthGuard)]
  },
  {
    path: 'meal-planner',
    loadComponent: () => import('./components/meal-planner/meal-planner.components').then(m => m.MealPlannerComponent),
    canActivate: [() => import('./guards/auth-guard').then(m => m.AuthGuard)]
  },
  {
    path: 'custom-recipe',
    loadComponent: () => import('./components/custom-recipe/custom-recipe.component').then(m => m.CustomRecipeComponent),
    canActivate: [() => import('./guards/auth-guard').then(m => m.AuthGuard)]
  },
  {
    path: 'custom-recipe/:id',
    loadComponent: () => import('./components/custom-recipe-view/custom-recipe-view.component').then(m => m.CustomRecipeViewComponent),
    canActivate: [() => import('./guards/auth-guard').then(m => m.AuthGuard)]
  },
  {
    path: 'community-recipes',
    loadComponent: () => import('./components/community-recipes/community-recipes.component').then(m => m.CommunityRecipesComponent)
  },

  // Admin Routes
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard.components').then(m => m.AdminDashboardComponent),
    canActivate: [() => import('./guards/auth-guard').then(m => m.AdminGuard)]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./components/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [() => import('./guards/auth-guard').then(m => m.AdminGuard)]
  },
  {
    path: 'admin/reviews',
    loadComponent: () => import('./review-management/review-management.component').then(m => m.ReviewManagementComponent),
    canActivate: [() => import('./guards/auth-guard').then(m => m.AdminGuard)]
  },
  {
    path: 'admin/analytics',
    loadComponent: () => import('./components/admin/analytics/analytics.component').then(m => m.AnalyticsComponent),
    canActivate: [() => import('./guards/auth-guard').then(m => m.AdminGuard)]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export { routes };