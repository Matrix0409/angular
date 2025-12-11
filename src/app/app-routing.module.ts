import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, AdminGuard } from './guards/auth-guard';

// Import components (use the actual file/class names present in the repo)
import { HomeComponent } from './components/home/home.components';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RecipeSearchComponent } from './components/recipe-search/recipe-search.component';
import { RecipeDetailsComponent } from './components/recipe-details/recipe-details.component';
import { AdvancedSearchComponent } from './components/advanced-search/advanced-search.components';
import { ProfileComponent } from './components/profile/profile.component';
import { MealPlannerComponent } from './components/meal-planner/meal-planner.components';
import { CustomRecipeComponent } from './components/custom-recipe/custom-recipe.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.components';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { ReviewManagementComponent } from './review-management/review-management.component';
import { AnalyticsComponent } from './components/admin/analytics/analytics.component';

export const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: RecipeSearchComponent },
  { path: 'recipes/:id', component: RecipeDetailsComponent },

  // Admin Login
  { path: 'admin/login', component: AdminLoginComponent },

  // Protected user routes
  {
    path: 'advanced-search',
    component: AdvancedSearchComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'meal-planner',
    component: MealPlannerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'custom-recipe',
    component: CustomRecipeComponent,
    canActivate: [AuthGuard]
  },

  // Admin routes
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/users',
    component: UserManagementComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/reviews',
    component: ReviewManagementComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/analytics',
    component: AnalyticsComponent,
    canActivate: [AdminGuard]
  },

  // Redirect unknown routes to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }