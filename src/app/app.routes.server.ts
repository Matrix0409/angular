import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Public routes
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },
  { path: 'search', renderMode: RenderMode.Prerender },
  { path: 'recipes/:id', renderMode: RenderMode.Prerender },
  
  // Protected user routes (prerender as-is; they'll handle auth client-side)
  { path: 'advanced-search', renderMode: RenderMode.Prerender },
  { path: 'profile', renderMode: RenderMode.Prerender },
  { path: 'meal-planner', renderMode: RenderMode.Prerender },
  { path: 'custom-recipe', renderMode: RenderMode.Prerender },
  
  // Admin routes
  { path: 'admin', renderMode: RenderMode.Prerender },
  { path: 'admin/users', renderMode: RenderMode.Prerender },
  { path: 'admin/reviews', renderMode: RenderMode.Prerender },
  { path: 'admin/analytics', renderMode: RenderMode.Prerender },
  
  // Catch-all fallback
  { path: '**', renderMode: RenderMode.Prerender }
];
