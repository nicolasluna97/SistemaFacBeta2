import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service'; // ⬅️ ruta correcta

// Control de refresh concurrente
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const auth = inject(AuthService);

  // Endpoints de auth donde NO se agrega token ni se hace refresh
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh');

  const token = auth.getToken();

  const cloned = (!isAuthEndpoint && token)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      // Login/Registro/Refresh: no interceptar (deja que el componente maneje 401/404)
      if (err.status === 401 && !isAuthEndpoint) {
        return handle401(cloned, next, auth);
      }
      return throwError(() => err);
    })
  );
};

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService
): Observable<HttpEvent<unknown>> {

  if (isRefreshing) {
    // esperar al refresh en curso
    return refreshTokenSubject.pipe(
      filter((t): t is string => t !== null),
      take(1),
      switchMap((newToken) => {
        const retried = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
        return next(retried);
      })
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  // 🔁 Refresh real (usa el método del servicio)
  return auth.refreshToken().pipe(
    switchMap((payload: any) => {
      const newToken = payload?.token ?? localStorage.getItem('token');
      if (!newToken) {
        // refresh falló
        auth.logout();
        return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));
      }
      refreshTokenSubject.next(newToken);
      const retried = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
      return next(retried);
    }),
    catchError((e) => {
      auth.logout();
      return throwError(() => e);
    }),
    finalize(() => { isRefreshing = false; })
  );
}