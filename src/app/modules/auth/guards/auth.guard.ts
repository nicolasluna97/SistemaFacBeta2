import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../products/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ AuthGuard checking authentication...');
  console.log('🛡️ Is authenticated:', authService.isAuthenticated());

  if (authService.isAuthenticated()) {
    console.log('🛡️ Access granted');
    return true;
  } else {
    console.log('🛡️ Access denied - redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }
};