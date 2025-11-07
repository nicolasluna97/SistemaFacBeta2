import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginResponse {
  user: any;
  token: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private tokenKey = 'token';
  private refreshTokenKey = 'refreshToken';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          this.setTokens(response.token, response.refreshToken);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    return this.http.post<{ token: string; refreshToken: string }>(
      `${this.apiUrl}/refresh`,
      { refreshToken }
    ).pipe(
      tap(tokens => {
        this.setTokens(tokens.token, tokens.refreshToken);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (token) {
      try {
        // Decodificar el JWT para obtener info del usuario
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserSubject.next({
          id: payload.id,
          email: payload.email,
          fullName: payload.fullName,
          isActive: payload.isActive,
          roles: payload.roles || ['user']
        });
      } catch (error) {
        this.logout();
      }
    }
  }
}