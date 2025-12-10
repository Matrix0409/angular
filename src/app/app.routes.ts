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
  { 
    path: 'advanced-search', 
    loadComponent: () => import('./components/advanced-search/advanced-search.components').then(m => m.AdvancedSearchComponent) 
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) 
  },
  { 
    path: 'meal-planner', 
    loadComponent: () => import('./components/meal-planner/meal-planner.components').then(m => m.MealPlannerComponent) 
  },
  { 
    path: 'custom-recipe', 
    loadComponent: () => import('./components/custom-recipe/custom-recipe.component').then(m => m.CustomRecipeComponent) 
  },
  { 
    path: 'custom-recipe/:id', 
    loadComponent: () => import('./components/custom-recipe-view/custom-recipe-view.component').then(m => m.CustomRecipeViewComponent) 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard.components').then(m => m.AdminDashboardComponent) 
  },
  { 
    path: 'admin/users', 
    loadComponent: () => import('./components/admin/user-management/user-management.component').then(m => m.UserManagementComponent) 
  },
  { 
    path: 'admin/reviews', 
    loadComponent: () => import('./review-management/review-management.component').then(m => m.ReviewManagementComponent) 
  },
  { 
    path: 'admin/analytics', 
    loadComponent: () => import('./components/admin/analytics/analytics.component').then(m => m.AnalyticsComponent) 
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