import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../modules/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  menuOpen = false;

  get isAuthenticated() { return this.auth.isAuthenticated(); }
  get user() { return (this as any).auth?._user?.() ?? null; } // usa tu signal interna

  toggleMenu() {
    if (!this.isAuthenticated) {
      this.gotoLogin();
      return;
    }
    this.menuOpen = !this.menuOpen;
  }

  gotoLogin() { this.router.navigateByUrl('/auth/login'); }
  gotoAccount() { this.router.navigateByUrl('/cuenta'); } // ajustá si tenés otra ruta
  gotoHelp() { this.router.navigateByUrl('/ayuda'); }     // ajustá si tenés otra ruta

  logout() {
    this.auth.logout();
    this.menuOpen = false;
    this.router.navigateByUrl('/auth/login');
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
  onEsc() { this.menuOpen = false; }
}