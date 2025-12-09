import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../modules/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css' // lo dejo como ya lo tenías y te viene funcionando
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  menuOpen = false;

  get isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  // esto ya lo usabas, lo dejo igual
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
    this.router.navigateByUrl('/cuenta');   // ✅ va a cargar AccountPage
  }

  gotoHelp() {
    this.router.navigateByUrl('/ayuda');    // (cuando tengas esa ruta)
  }

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
  onEsc() {
    this.menuOpen = false;
  }
}
