// src/app/modules/auth/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getAccessToken();

  // ✅ sirve para '/api/...' y para 'http://localhost:3000/api/...'
  const isApiCall = req.url.includes('/api/');

  const authReq =
    token && isApiCall
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err?.status === 401 || err?.status === 403) {
        auth.logout();

        const current = router.url || '';
        if (!current.startsWith('/auth/')) {
          router.navigate(['/auth/login'], { queryParams: { returnUrl: current } });
        } else {
          router.navigate(['/auth/login']);
        }
      }
      return throwError(() => err);
    }),
  );
};
