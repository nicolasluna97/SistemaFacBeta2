import { Injectable, inject } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthBootstrapService {
  private auth = inject(AuthService);

  async init(): Promise<void> {
    if (this.auth.isAuthenticated()) return;

    try {
      const resp = await firstValueFrom(
        this.auth.refreshToken().pipe(catchError(() => of(null))),
      );

      if (!resp?.token) {
        this.auth.logout();
        return;
      }

      this.auth.setSession({ token: resp.token }, this.auth.user());
    } catch {
      this.auth.logout();
    }
  }
}