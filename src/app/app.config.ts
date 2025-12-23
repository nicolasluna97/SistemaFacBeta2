// src/app/app.config.ts
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './modules/auth/interceptors/auth.interceptor';
import { AuthBootstrapService } from './modules/auth/services/auth-bootstrap.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),

    provideAppInitializer(() => {
      const boot = inject(AuthBootstrapService);
      // ✅ devolver directamente el Promise (o void)
      return boot.init();
    }),
  ],
};
