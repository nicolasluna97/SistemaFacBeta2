// src/app/modules/auth/services/auth.service.ts
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

type JwtPayload = { exp?: number; [key: string]: any };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  user = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  // ========= HTTP (Auth API) =========

  // Mantengo el nombre que tu login ya usa: loginDetailed(email, password)
  loginDetailed(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password });
  }

  register(dto: RegisterDto): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>('/api/auth/register', dto);
  }

  verifyEmail(email: string, code: string): Observable<VerifyEmailResponse> {
    return this.http.post<VerifyEmailResponse>('/api/auth/verify-email', { email, code });
  }

  resendVerificationCode(email: string): Observable<ResendCodeResponse> {
    return this.http.post<ResendCodeResponse>('/api/auth/resend-code', { email });
  }

  refreshToken(refreshToken: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>('/api/auth/refresh', { refreshToken });
  }

  // ========= Session / Tokens =========

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setSession(tokens: { token: string; refreshToken?: string }, user?: any) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.token);

    if (tokens.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }

    if (user !== undefined) this.user.set(user);
  }

  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.user.set(null);
  }

  isAuthenticated(): boolean {
    return this.isTokenValid(this.getAccessToken());
  }

  // ========= Helpers =========

  private isTokenValid(token: string | null): boolean {
    if (!token) return false;
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) return false;

    const expMs = payload.exp * 1000;
    return expMs > Date.now();
  }

  private decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(payloadBase64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
