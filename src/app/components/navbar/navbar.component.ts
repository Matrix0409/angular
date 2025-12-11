import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a routerLink="/" class="navbar-brand">
          🍳 Recipe Finder
        </a>
        
        <div class="navbar-menu">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            Home
          </a>
          <a routerLink="/search" routerLinkActive="active">
            Search
          </a>
          <a routerLink="/community-recipes" routerLinkActive="active">
            Community Recipes
          </a>
          
          <ng-container *ngIf="currentUser">
            <a routerLink="/advanced-search" routerLinkActive="active">
              Advanced Search
            </a>
            <a routerLink="/meal-planner" routerLinkActive="active">
              Meal Planner
            </a>
            <a routerLink="/profile" routerLinkActive="active">
              Profile
            </a>
            
            <ng-container *ngIf="isAdmin">
              <a routerLink="/admin" routerLinkActive="active">
                Admin Dashboard
              </a>
            </ng-container>
            
            <span class="navbar-user">
              Hello, {{currentUser.name}}
            </span>
            <button (click)="logout()" class="btn-logout">
              Logout
            </button>
          </ng-container>
          
          <ng-container *ngIf="!currentUser">
            <a routerLink="/login" routerLinkActive="active">
              Login
            </a>
            <a routerLink="/register" routerLinkActive="active">
              Register
            </a>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .navbar-brand {
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      text-decoration: none;
    }
    
    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    
    .navbar-menu a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background 0.3s;
    }
    
    .navbar-menu a:hover,
    .navbar-menu a.active {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .navbar-user {
      color: white;
      font-weight: 500;
    }
    
    .btn-logout {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .btn-logout:hover {
      background: white;
      color: #667eea;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}