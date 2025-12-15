import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { Navbar } from 'src/app/core/navbar/navbar';
import { Sidenav } from 'src/app/core/sidenav/sidenav';

import { MovementsController } from '../movements.controller';
import type { Movement, MovementRange } from '../entities/movement.entity';

@Component({
  standalone: true,
  selector: 'app-movements-page',
  templateUrl: './movements-page.html',
  styleUrls: ['./movements-page.css'],
  imports: [CommonModule, DatePipe, Navbar, Sidenav],
})
export class MovementsPage {
  private movementsCtrl = inject(MovementsController);

  // UI
  range = signal<MovementRange>('24h'); // default
  loading = signal(false);
  error = signal<string | null>(null);

  // data
  movements = signal<Movement[]>([]);

  // paginado
  page = signal(1);
  limit = signal(20);
  totalPages = signal(1);
  total = signal(0);

  canPrev = computed(() => this.page() > 1);
  canNext = computed(() => this.page() < this.totalPages());

  ngOnInit(): void {
    // carga inicial automática: últimas 24 horas
    this.search(1);
  }

  onChangeRange(value: string) {
    // value viene del <select>
    this.range.set(value as MovementRange);
  }

  search(targetPage?: number) {
    const nextPage = targetPage ?? 1;

    this.loading.set(true);
    this.error.set(null);

    this.movementsCtrl.getMovements({
      range: this.range(),
      page: nextPage,
      limit: this.limit(),
    }).subscribe({
      next: (res) => {
        this.movements.set(res.data ?? []);
        this.page.set(res.page ?? nextPage);
        this.limit.set(res.limit ?? this.limit());
        this.total.set(res.total ?? 0);
        this.totalPages.set(res.totalPages ?? 1);
        this.loading.set(false);
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          err?.message ||
          'No se pudieron cargar los movimientos.';
        this.error.set(String(msg));
        this.loading.set(false);
      }
    });
  }

  prevPage() {
    if (!this.canPrev()) return;
    this.search(this.page() - 1);
  }

  nextPage() {
    if (!this.canNext()) return;
    this.search(this.page() + 1);
  }

  // Helpers UI
  formatPriceLabel(priceKey: 1 | 2 | 3 | 4) {
    return `Precio ${priceKey}`;
  }
}
