import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { AuthResponse } from '../interfaces/auth-response.interface';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
type LoginOutcome = 'ok' | 'wrong-password' | 'user-not-found' | 'db-connection' | 'unknown';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private http = inject(HttpClient);


  private baseUrl = 'http://localhost:3000/api';

  constructor() {
    console.log('🎯 AuthService initialized with URL:', this.baseUrl);
    this.checkAuthStatus();
  }

  // ====== Getters útiles (opcionales para la UI) ======
  get authStatus() { return this._authStatus; }
  get user() { return this._user; }
  get token() { return this._token; }

  isAuthenticated(): boolean {
    return this._authStatus() === 'authenticated';
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this._token.set(token);
      this._authStatus.set('authenticated');
    } else {
      this._authStatus.set('not-authenticated');
    }
  }

  getToken(): string | null {
    return this._token();
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');
    localStorage.removeItem('token');
  }

  // ====== Tu método original (no lo toco) ======
  login(email: string, password: string): Observable<boolean> {
    const url = `${this.baseUrl}/auth/login`;

    console.log('🚀 === MAKING LOGIN REQUEST ===');
    console.log('🚀 URL:', url);
    console.log('🚀 Email:', email);

    return this.http.post<AuthResponse>(url, {
      email: email,
      password: password
    })
      .pipe(
        tap((resp) => {
        console.log('✅ Login successful!');
        this._user.set(resp.user);
        this._authStatus.set('authenticated');
        this._token.set(resp.token);
        localStorage.setItem('token', resp.token);
        localStorage.setItem('refreshToken', resp.refreshToken);
        }),
        map(() => true),
        catchError((error: any) => {
          console.error('❌ Login failed');
          console.error('❌ Error status:', error.status);
          console.error('❌ Error URL:', error.url);
          this._user.set(null);
          this._token.set(null);
          this._authStatus.set('not-authenticated');
          return of(false);
        })
      );
  }

  register(dto: { fullName: string; email: string; password: string }) {
  const url = `${this.baseUrl}/auth/register`;
  return this.http.post<{ user: any; token: string; refreshToken: string }>(url, dto).pipe(
    tap((resp) => {
      this._user.set(resp.user);
      this._authStatus.set('authenticated');
      this._token.set(resp.token);
      localStorage.setItem('token', resp.token);
      localStorage.setItem('refreshToken', resp.refreshToken);
    }),
    map(() => true),
    catchError(() => of(false))
  );
}

  // ====== Nuevo: login con errores tipados para la UI ======
  loginDetailed(email: string, password: string): Observable<'ok' | 'wrong-password' | 'user-not-found' | 'db-connection' | 'unknown'> {
  const url = `${this.baseUrl}/auth/login`;

  console.log('🚀 === MAKING LOGIN REQUEST (detailed) ===');
  console.log('🚀 URL:', url);
  console.log('🚀 Email:', email);

  return this.http.post<AuthResponse>(url, { email, password }).pipe(
    tap((resp) => {
      console.log('✅ Login successful (detailed)!');
      this._user.set(resp.user);
      this._authStatus.set('authenticated');
      this._token.set(resp.token);
      localStorage.setItem('token', resp.token);
      localStorage.setItem('refreshToken', resp.refreshToken);
    }),
    map(() => 'ok' as const),
    catchError((error: any) => {
      console.error('❌ Login failed (detailed)');
      console.error('❌ Error status:', error?.status);
      console.error('❌ Error URL:', error?.url);

      this._user.set(null);
      this._token.set(null);
      this._authStatus.set('not-authenticated');

      // ---------- MAPEAMOS POR CONTENIDO DEL MENSAJE ----------
      const rawMsg = error?.error?.message;
      const msg = Array.isArray(rawMsg)
        ? rawMsg.join(' ').toLowerCase()
        : (typeof rawMsg === 'string' ? rawMsg.toLowerCase() : '');

      const code = (error?.error?.code || '').toString().toLowerCase();

      // Señales típicas del backend de Nest:
      // "Credentials are not valid (password)" -> wrong-password
      // "Credentials are not valid (email)"    -> user-not-found
      if (msg.includes('credentials') && msg.includes('password')) return of('wrong-password' as const);
      if (msg.includes('credentials') && msg.includes('email'))    return of('user-not-found' as const);
      if (msg.includes('wrong_password') || code.includes('wrong_password') || code.includes('invalid_credentials')) {
        return of('wrong-password' as const);
      }
      if (msg.includes('user not found') || code.includes('user_not_found')) {
        return of('user-not-found' as const);
      }

      // ---------- Mapeo por status (fallback) ----------
      if (error?.status === 404) return of('user-not-found' as const);
      if (error?.status === 401) return of('wrong-password' as const);
      if (error?.status === 0 || (error?.status >= 500 && error?.status < 600)) {
        return of('db-connection' as const);
      }

      // Algunos setups devuelven 400 en credenciales inválidas -> asumimos wrong-password si no hay más pistas
      if (error?.status === 400 && msg.includes('credentials')) return of('wrong-password' as const);

      return of('unknown' as const);
    })
  );
}

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
  const url = `${this.baseUrl}/auth/refresh`;
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    console.warn('❌ No refresh token found in localStorage');
    return throwError(() => new Error('No refresh token found'));
  }

  console.log('🔁 Requesting refresh token...');

  return this.http.post<{ token: string; refreshToken: string }>(
    url,
    { refreshToken },
  ).pipe(
    tap((resp) => {
      console.log('✅ Token refreshed successfully');
      localStorage.setItem('token', resp.token);
      localStorage.setItem('refreshToken', resp.refreshToken);
    })
  );
 }
}