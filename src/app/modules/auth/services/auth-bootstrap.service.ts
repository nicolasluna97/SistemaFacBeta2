// src/app/modules/auth/services/auth-bootstrap.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthBootstrapService {
  private auth = inject(AuthService);
  private router = inject(Router);

  async init(): Promise<void> {
    // 1) si el access token ya es válido, no hacemos nada
    if (this.auth.isAuthenticated()) return;

    // 2) si hay refresh token, intentamos refrescar
    const rt = this.auth.getRefreshToken();
    if (!rt) {
      this.auth.logout();
      return;
    }

    try {
      const resp = await firstValueFrom(
        this.auth.refreshToken(rt).pipe(
          catchError(() => of(null))
        )
      );

      if (!resp?.token) {
        this.auth.logout();
        return;
      }

      // guardamos nuevos tokens (y mantenemos el user actual si lo hubiera)
      this.auth.setSession(
        { token: resp.token, refreshToken: resp.refreshToken },
        this.auth.user()
      );
    } catch {
      this.auth.logout();
    }
  }
}
