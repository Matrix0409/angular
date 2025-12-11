import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <header class="admin-header">
        <h1>Admin Dashboard</h1>
        <div class="admin-profile">
          <span>{{ (authService.currentUser | async)?.name }} (Admin)</span>
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </header>
      
      <div class="dashboard-grid">
        <!-- User Management Card -->
        <div class="dashboard-card" routerLink="/admin/users">
          <div class="card-icon">👥</div>
          <h3>User Management</h3>
          <p>View, search, and manage registered users.</p>
          <button class="card-action">Manage Users →</button>
        </div>

        <!-- Analytics Card -->
        <div class="dashboard-card" routerLink="/admin/analytics">
          <div class="card-icon">📊</div>
          <h3>Analytics</h3>
          <p>View site statistics, popular recipes, and user growth.</p>
          <button class="card-action">View Analytics →</button>
        </div>

        <!-- Review Management Card -->
        <div class="dashboard-card" routerLink="/admin/reviews">
          <div class="card-icon">⭐</div>
          <h3>Review Management</h3>
          <p>Moderate user reviews and comments.</p>
          <button class="card-action">Manage Reviews →</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      min-height: 100vh;
      background-color: #f4f6f8;
      font-family: 'Inter', sans-serif;
    }

    .admin-header {
      background: #2c3e50;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .admin-header h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .admin-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logout-btn {
      background: transparent;
      border: 1px solid white;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: white;
      color: #2c3e50;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .dashboard-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 12px rgba(0,0,0,0.1);
    }

    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .dashboard-card h3 {
      color: #2c3e50;
      margin: 0.5rem 0;
      font-size: 1.25rem;
    }

    .dashboard-card p {
      color: #7f8c8d;
      margin-bottom: 1.5rem;
      flex-grow: 1;
    }

    .card-action {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .dashboard-card:hover .card-action {
      background: #2980b9;
    }
  `]
})
export class AdminDashboardComponent {
  constructor(public authService: AuthService, private router: Router) { }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}