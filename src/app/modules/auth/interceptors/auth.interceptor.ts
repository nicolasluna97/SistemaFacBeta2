import { HttpInterceptorFn } from '@angular/common/http';

function readToken(): string | null {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    null
  );
}

function isApiRequest(url: string): boolean {
  // Cubre:
  // - "/api/..."
  // - "api/..."
  // - "http://localhost:3000/api/..."
  return url.includes('/api/') || url.startsWith('api/');
}

function isAuthEndpoint(url: string): boolean {
  // Cubre endpoints típicos de auth (ajustá si tus rutas difieren)
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/refresh')
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiRequest(req.url)) return next(req);
  if (isAuthEndpoint(req.url)) return next(req);

  const token = readToken();
  if (!token) return next(req);

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
