import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { Subscription, finalize } from 'rxjs';

import { Navbar } from 'src/app/core/navbar/navbar';
import { Sidenav } from 'src/app/core/sidenav/sidenav';

import { StatisticsController } from '../statistics.controller';
import type { StatsMode, StatisticsResponse } from '../entities/statistics.entity';

import { Chart, registerables, type ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  standalone: true,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  imports: [CommonModule, Navbar, Sidenav],
})
export class StatisticsComponent implements AfterViewInit, OnDestroy {
  private statsCtrl = inject(StatisticsController);

  private sub = new Subscription();

  // ===== UI state =====
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  // ===== Filters =====
  mode = signal<StatsMode>('day');

  dayInput = signal<string>(this.todayISO());
  weekAnchorInput = signal<string>(this.todayISO());
  monthInput = signal<string>(this.currentMonthISO());
  year = signal<number>(new Date().getFullYear());

  yearsList = signal<number[]>(
    Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i),
  );

  // ===== KPI =====
  totalAmount = signal<number>(0);
  totalCount = signal<number>(0);

  // ===== Chart =====
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    // 1) Creamos chart vacío
    this.createChart();

    // 2) Primer render real con data
    this.fetchAndRender();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  // ================== Handlers UI ==================

  onChangeMode(value: StatsMode) {
    this.mode.set(value);
    this.fetchAndRender();
  }

  onChangeDay(value: string) {
    this.dayInput.set(value);
    this.fetchAndRender();
  }

  onChangeWeekAnchor(value: string) {
    this.weekAnchorInput.set(value);
    this.fetchAndRender();
  }

  onChangeMonth(value: string) {
    this.monthInput.set(value);
    this.fetchAndRender();
  }

  onChangeYear(value: string) {
    this.year.set(Number(value));
    this.fetchAndRender();
  }

  // ================== Fetch + Render ==================

  private fetchAndRender() {
    this.errorMsg.set(null);
    this.loading.set(true);

    const dto = this.buildDto();

    const s = this.statsCtrl
      .getStatistics(dto)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res: StatisticsResponse) => {
          // KPI
          this.totalAmount.set(Number(res.totalAmount ?? 0));
          this.totalCount.set(Number(res.totalSales ?? 0));

          // Chart
          this.updateChart(res.labels ?? [], (res.values ?? []).map(v => Number(v)));
        },
        error: (err: any) => {
          const msg =
            err?.error?.message ||
            err?.message ||
            'No se pudieron cargar las estadísticas.';
          this.errorMsg.set(String(msg));
          // deja chart como estaba (no lo rompe)
        },
      });

    this.sub.add(s);
  }

  private buildDto() {
    const m = this.mode();

    if (m === 'day') {
      return { mode: 'day' as const, anchor: this.dayInput() };
    }
    if (m === 'week') {
      return { mode: 'week' as const, anchor: this.weekAnchorInput() };
    }
    if (m === 'month') {
      // anchor: YYYY-MM -> lo enviamos igual, backend lo interpreta
      return { mode: 'month' as const, anchor: this.monthInput() };
    }
    // year
    return { mode: 'year' as const, anchor: String(this.year()) };
  }

  // ================== Chart.js ==================

  private createChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Recaudación',
            data: [],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(labels: string[], values: number[]) {
    if (!this.chart) return;

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = values;

    this.chart.update();
  }

  // ================== Helpers ==================

  private todayISO(): string {
    // YYYY-MM-DD
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private currentMonthISO(): string {
    // YYYY-MM
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  }
}
