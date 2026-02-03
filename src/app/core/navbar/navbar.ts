import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../modules/auth/services/auth.service';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  menuOpen = false;

  // ===== Tema =====
  private readonly THEME_KEY = 'app_theme';
  isDark = false;

  constructor() {
    this.initTheme();
  }

  get isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  get user() {
    return (this as any).auth?._user?.() ?? null;
  }

  toggleMenu() {
    if (!this.isAuthenticated) {
      this.gotoLogin();
      return;
    }
    this.menuOpen = !this.menuOpen;
  }

  gotoLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  gotoAccount() {
    this.router.navigateByUrl('/cuenta');
  }

  gotoHelp() {
    this.router.navigateByUrl('/ayuda');
  }

  logout() {
    this.auth.logout();
    this.menuOpen = false;
    this.router.navigateByUrl('/auth/login');
  }

  // ===== Tema methods =====

  toggleTheme() {
    const next: ThemeMode = this.isDark ? 'light' : 'dark';
    this.applyTheme(next, true);
  }

  private initTheme() {
    const saved = (localStorage.getItem(this.THEME_KEY) as ThemeMode | null);
    const mode: ThemeMode = saved === 'dark' || saved === 'light' ? saved : 'light';
    this.applyTheme(mode, false);
  }

  private applyTheme(mode: ThemeMode, persist: boolean) {
    this.isDark = mode === 'dark';

    // Usamos class en body (simple y robusto)
    document.body.classList.toggle('theme-dark', this.isDark);

    if (persist) {
      localStorage.setItem(this.THEME_KEY, mode);
    }
  }

  // Cerrar menú si clic fuera del navbar
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.menuOpen) return;
    const el = this.host.nativeElement;
    if (!el.contains(ev.target as Node)) this.menuOpen = false;
  }

  // Cerrar menú con Escape
  @HostListener('document:keydown.escape')
  onEsc() {
    this.menuOpen = false;
  }
}
