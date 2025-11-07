import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

type ServerErrorKind = 'wrong-password' | 'user-not-found' | 'db-connection' | 'unknown';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
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
    // evita dobles submits por Enter + click
    if (this.loading) return;

    this.serverError = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.getRawValue()!;

    console.log('▶️ Intentando login (detailed) con', email);

    this.auth.loginDetailed(email!, password!)
      .pipe(
        finalize(() => {
          this.loading = false;
          console.log('⏹ finalize(): loading = false');
          // fuerza actualización de la vista por si el detector no se dispara
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (outcome) => {
          console.log('✅ Resultado login:', outcome);

          switch (outcome) {
            case 'ok':
              this.router.navigateByUrl('/');
              break;

            case 'wrong-password':
              this.serverError = {
                kind: 'wrong-password',
                message: 'La contraseña es incorrecta. Verificala e intentá de nuevo.'
              };
              break;

            case 'user-not-found':
              this.serverError = {
                kind: 'user-not-found',
                message: 'No encontramos una cuenta con ese email. ¿Querés registrarte?'
              };
              break;

            case 'db-connection':
              this.serverError = {
                kind: 'db-connection',
                message: 'No pudimos conectarnos. Intentalo más tarde.'
              };
              break;

            default:
              this.serverError = {
                kind: 'unknown',
                message: 'Ocurrió un error inesperado. Probá nuevamente.'
              };
          }

          // por si el cambio de serverError no se refleja de inmediato
          this.cdr.detectChanges();
        },
        error: (err) => {
          // en principio no debería entrar acá porque loginDetailed ya hace catchError
          console.error('🛑 Error inesperado en subscribe:', err);
          this.serverError = { kind: 'unknown', message: 'Ocurrió un error inesperado. Probá nuevamente.' };
          this.cdr.detectChanges();
        }
      });
  }
}