import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  LoginResponse,
  RegisterDto,
  RegisterResponse,
  VerifyEmailResponse,
  ResendCodeResponse,
  RefreshResponse,
} from '../interfaces/auth.models';

type JwtPayload = { exp?: number; sub?: string; iat?: number; [key: string]: any };

@Injectable({ providedIn: 'root' })
export class AuthService {
  // access token en memoria (menos exposición que localStorage)
  private accessToken: string | null = null;
  user = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  loginDetailed(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      '/api/auth/login',
      { email, password },
      { withCredentials: true },
    );
  }

  register(dto: RegisterDto): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>('/api/auth/register', dto);
  }

  verifyEmail(email: string, code: string): Observable<VerifyEmailResponse> {
    return this.http.post<VerifyEmailResponse>(
      '/api/auth/verify-email',
      { email, code },
      { withCredentials: true },
    );
  }

  resendVerificationCode(email: string): Observable<ResendCodeResponse> {
    return this.http.post<ResendCodeResponse>('/api/auth/resend-code', { email });
  }

  refreshToken(): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(
      '/api/auth/refresh',
      {},
      { withCredentials: true },
    );
  }

  logoutServer(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(
      '/api/auth/logout',
      {},
      { withCredentials: true },
    );
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setSession(tokens: { token: string }, user?: any) {
    this.accessToken = tokens.token;
    if (user !== undefined) this.user.set(user);
  }

  logout() {
    this.accessToken = null;
    this.user.set(null);
  }

  isAuthenticated(): boolean {
    return this.isTokenValid(this.accessToken);
  }

  private isTokenValid(token: string | null): boolean {
    if (!token) return false;
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) return false;
    return payload.exp * 1000 > Date.now();
  }

  private decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(payloadBase64);
      const payload = JSON.parse(json);

      if (!payload.exp || !payload.sub || typeof payload.exp !== 'number') return null;
      return payload as JwtPayload;
    } catch {
      return null;
    }
  }
}