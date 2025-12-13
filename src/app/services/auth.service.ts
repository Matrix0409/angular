import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../models/models';
import { UserDataService } from './user-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.jsonServerUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  // Helper method to safely access localStorage
  private getStoredUser(): User | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  // Helper method to safely set localStorage
  private setStoredUser(user: User | null): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  constructor(
    private http: HttpClient,
    private userDataService: UserDataService
  ) {
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  public get isAdmin(): boolean {
    return this.currentUserSubject.value?.isAdmin || false;
  }

  login(email: string, password: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}&password=${password}`)
      .pipe(
        switchMap(users => {
          if (users && users.length > 0) {
            const user = users[0];
            this.setStoredUser(user);
            this.currentUserSubject.next(user);
            // Sync guest data
            return this.userDataService.syncGuestData(user.id!).pipe(
              map(() => user)
            );
          }
          return of(null);
        }),
        catchError(error => {
          console.error('Login error:', error);
          return of(null);
        })
      );
  }

  register(user: User): Observable<User | null> {
    // Check if email already exists
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${user.email}`)
      .pipe(
        map(existingUsers => {
          if (existingUsers && existingUsers.length > 0) {
            throw new Error('Email already exists');
          }
          return user;
        }),
        switchMap(() => {
          // Create new user
          const newUser: User = {
            email: user.email,
            password: user.password,
            name: user.name,
            isAdmin: false
          };
          return this.http.post<User>(`${this.apiUrl}/users`, newUser);
        }),
        switchMap(createdUser => {
          this.setStoredUser(createdUser);
          this.currentUserSubject.next(createdUser);
          // Sync guest data
          return this.userDataService.syncGuestData(createdUser.id!).pipe(
            map(() => createdUser)
          );
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return of(null);
        })
      );
  }

  logout(): void {
    this.setStoredUser(null);
    this.currentUserSubject.next(null);
  }

  updateUser(user: User): void {
    this.setStoredUser(user);
    this.currentUserSubject.next(user);
  }
}