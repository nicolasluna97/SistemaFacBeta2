// src/app/modules/auth/pages/login/login.component.ts
import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { LoginResponse } from '../../interfaces/auth.models';

type ServerErrorKind = 'wrong-password' | 'user-not-found' | 'db-connection' | 'unknown';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  serverError: { kind: ServerErrorKind; message: string } | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get email() { return this.loginForm.controls.email; }
  get password() { return this.loginForm.controls.password; }

  onSubmit() {
    if (this.loading) return;

    this.serverError = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.getRawValue();

    this.auth.loginDetailed(email!, password!)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (resp: LoginResponse) => {
          // Login OK: guardamos sesión real (tokens + user)
          this.auth.setSession(
            { token: resp.token, refreshToken: resp.refreshToken },
            resp
          );

          // Si venías redirigido por guard, volvemos a returnUrl
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          this.router.navigateByUrl(returnUrl || '/inicio');

          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          // Login falló: mapeamos mensajes según el backend (Nest UnauthorizedException etc.)
          const msg = this.extractBackendMessage(err);

          if (msg.includes('password')) {
            this.serverError = {
              kind: 'wrong-password',
              message: 'La contraseña es incorrecta. Verificala e intentá de nuevo.',
            };
          } else if (msg.includes('email') || msg.includes('no encontrado') || msg.includes('not found')) {
            this.serverError = {
              kind: 'user-not-found',
              message: 'No encontramos una cuenta con ese email. ¿Querés registrarte?',
            };
          } else if (err.status === 0 || msg.includes('ECONN') || msg.includes('connect')) {
            this.serverError = {
              kind: 'db-connection',
              message: 'No pudimos conectarnos. Intentalo más tarde.',
            };
          } else {
            this.serverError = {
              kind: 'unknown',
              message: msg || 'Ocurrió un error inesperado. Probá nuevamente.',
            };
          }

          this.cdr.detectChanges();
        },
      });
  }

  private extractBackendMessage(err: HttpErrorResponse): string {
    // Nest suele devolver { message: string | string[] }
    const e: any = err.error;

    if (!e) return '';

    if (typeof e === 'string') return e;

    const m = e.message;
    if (Array.isArray(m)) return m.join(' | ');
    if (typeof m === 'string') return m;

    // fallback
    return '';
  }
}
