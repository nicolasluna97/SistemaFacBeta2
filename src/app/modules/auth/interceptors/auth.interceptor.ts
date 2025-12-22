
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getAccessToken();

  // Adjuntamos token SOLO a /api/... (como tus requests)
  const isApiCall = req.url.startsWith('/api/');

  const authReq =
    token && isApiCall
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((err) => {
      // Si el backend dice 401/403: sesión inválida → limpiar y forzar login
      if (err?.status === 401 || err?.status === 403) {
        auth.logout();
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url },
        });
      }
      return throwError(() => err);
    }),
  );
};
