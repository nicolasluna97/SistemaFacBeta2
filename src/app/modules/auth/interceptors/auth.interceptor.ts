import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getAccessToken();
  const isApiCall = req.url.includes('/api/');
  const isAuthRefreshCall = req.url.includes('/api/auth/refresh');

  let request = req;

  if (isApiCall && token) {
    request = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
  } else if (isAuthRefreshCall || isApiCall) {
    request = req.clone({ withCredentials: true });
  }

  return next(request).pipe(
    catchError((err) => {
      if (err?.status === 401 || err?.status === 403) {
        auth.logout();
        const current = router.url || '';
        if (!current.startsWith('/auth/')) {
          router.navigate(['/auth/login'], { queryParams: { returnUrl: current } });
        }
      }
      return throwError(() => err);
    }),
  );
};