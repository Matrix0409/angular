import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDataService } from '../../../services/user-data.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-management">
      <div class="page-header">
        <h1>👥 User Management</h1>
        <p>View and manage all registered users</p>
      </div>

      <div class="management-card">
        <div class="card-header">
          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (input)="filterUsers()"
              placeholder="🔍 Search users by name or email..."
            />
          </div>
          <div class="user-count">
            Total Users: <strong>{{filteredUsers.length}}</strong>
          </div>
        </div>

        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading users...</p>
        </div>

        <div *ngIf="!loading && filteredUsers.length === 0" class="no-users">
          <p>No users found</p>
        </div>

        <div class="users-table" *ngIf="!loading && filteredUsers.length > 0">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsers">
                <td>{{user.id}}</td>
                <td>
                  <div class="user-name">
                    <span class="user-avatar">{{user.name.charAt(0).toUpperCase()}}</span>
                    {{user.name}}
                  </div>
                </td>
                <td>{{user.email}}</td>
                <td>
                  <span class="badge" [class.admin]="user.isAdmin">
                    {{user.isAdmin ? 'Admin' : 'User'}}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      (click)="toggleAdminRole(user)" 
                      class="btn-role"
                      [disabled]="user.id === currentUserId"
                      [title]="user.id === currentUserId ? 'Cannot modify your own role' : ''"
                    >
                      {{user.isAdmin ? '⬇️ Revoke Admin' : '⬆️ Make Admin'}}
                    </button>
                    <button 
                      (click)="confirmDelete(user)" 
                      class="btn-delete"
                      [disabled]="user.id === currentUserId"
                      [title]="user.id === currentUserId ? 'Cannot delete yourself' : ''"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal" *ngIf="showDeleteModal" (click)="cancelDelete()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>⚠️ Confirm Delete</h2>
          <p>Are you sure you want to delete this user?</p>
          <div class="user-info-box">
            <strong>{{userToDelete?.name}}</strong>
            <p>{{userToDelete?.email}}</p>
          </div>
          <p class="warning-text">
            This will permanently delete:
          </p>
          <ul class="warning-list">
            <li>User account</li>
            <li>All favorites</li>
            <li>All meal plans</li>
            <li>All reviews</li>
            <li>All custom recipes</li>
          </ul>
          <div class="modal-actions">
            <button (click)="deleteUser()" class="btn-confirm" [disabled]="deleting">
              {{deleting ? 'Deleting...' : '🗑️ Yes, Delete User'}}
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
    .user-management {
      max-width: 1400px;
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      border-bottom: 2px solid #e0e0e0;
    }

    .search-box {
      flex: 1;
      max-width: 500px;
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

    .user-count {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .user-count strong {
      color: #2c3e50;
      font-size: 1.3rem;
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

    .no-users {
      text-align: center;
      padding: 4rem;
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .users-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f8f9fa;
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #2c3e50;
      border-bottom: 2px solid #e0e0e0;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;
      color: #34495e;
    }

    tbody tr:hover {
      background: #f8f9fa;
    }

    .user-name {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .badge {
      display: inline-block;
      padding: 0.375rem 0.875rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      background: #e0e0e0;
      color: #2c3e50;
    }

    .badge.admin {
      background: #667eea;
      color: white;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-role, .btn-delete {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-role {
      background: #3498db;
      color: white;
    }

    .btn-role:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn-delete {
      background: #e74c3c;
      color: white;
    }

    .btn-delete:hover:not(:disabled) {
      background: #c0392b;
    }

    .btn-role:disabled,
    .btn-delete:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .user-info-box {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .user-info-box strong {
      color: #2c3e50;
      display: block;
      margin-bottom: 0.25rem;
    }

    .user-info-box p {
      margin: 0;
      color: #7f8c8d;
    }

    .warning-text {
      color: #e74c3c;
      font-weight: 600;
      margin-top: 1rem;
    }

    .warning-list {
      color: #e74c3c;
      margin: 0.5rem 0 1.5rem 1.5rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
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
      .card-header {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        max-width: 100%;
      }

      .users-table {
        font-size: 0.875rem;
      }

      th, td {
        padding: 0.75rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-role, .btn-delete {
        width: 100%;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';
  loading: boolean = true;
  deleting: boolean = false;
  
  showDeleteModal: boolean = false;
  userToDelete: User | null = null;
  
  successMessage: string = '';
  errorMessage: string = '';
  
  currentUserId: number = 0;

  constructor(
    private userDataService: UserDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUserValue?.id || 0;
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userDataService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.showError('Failed to load users');
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
  }

  toggleAdminRole(user: User): void {
    if (!user.id) return;

    const newAdminStatus = !user.isAdmin;
    this.userDataService.updateUser(user.id, { isAdmin: newAdminStatus }).subscribe({
      next: () => {
        user.isAdmin = newAdminStatus;
        this.showSuccess(`User role updated to ${newAdminStatus ? 'Admin' : 'User'}`);
      },
      error: (err) => {
        console.error('Error updating user role:', err);
        this.showError('Failed to update user role');
      }
    });
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  deleteUser(): void {
    if (!this.userToDelete?.id) return;

    this.deleting = true;
    const userId = this.userToDelete.id;

    // Delete user and all associated data
    forkJoin({
      favorites: this.userDataService.deleteFavoritesByUserId(userId),
      mealPlans: this.userDataService.deleteMealPlansByUserId(userId),
      reviews: this.userDataService.deleteReviewsByUserId(userId),
      customRecipes: this.userDataService.deleteCustomRecipesByUserId(userId),
      user: this.userDataService.deleteUser(userId)
    }).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== userId);
        this.filterUsers();
        this.showSuccess('User and all associated data deleted successfully');
        this.showDeleteModal = false;
        this.userToDelete = null;
        this.deleting = false;
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        this.showError('Failed to delete user');
        this.deleting = false;
      }
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