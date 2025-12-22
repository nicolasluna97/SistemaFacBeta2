import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Navbar } from "src/app/core/navbar/navbar";
import { Sidenav } from "src/app/core/sidenav/sidenav";

type StatsMode = 'day' | 'week' | 'month' | 'year';

@Component({
  selector: 'app-statistics',
  standalone: true,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  imports: [CommonModule, Navbar, Sidenav],
})
export class StatisticsComponent {
  mode = signal<StatsMode>('day');

  // Inputs
  dayInput = signal<string>(this.todayISO());
  weekAnchorInput = signal<string>(this.todayISO());
  monthInput = signal<string>(this.currentMonthISO());
  year = signal<number>(new Date().getFullYear());

  // KPI
  totalAmount = signal<number>(0);
  totalCount = signal<number>(0);

  // Years dropdown
  yearsList = signal<number[]>(
    Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)
  );

  // Helpers
  private todayISO(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private currentMonthISO(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  }

  // Handlers
  onChangeMode(value: StatsMode) {
    this.mode.set(value);
    this.render();
  }

  onChangeDay(value: string) {
    this.dayInput.set(value);
    this.render();
  }

  onChangeWeekAnchor(value: string) {
    this.weekAnchorInput.set(value);
    this.render();
  }

  onChangeMonth(value: string) {
    this.monthInput.set(value);
    this.render();
  }

  onChangeYear(value: string) {
    this.year.set(Number(value));
    this.render();
  }

  render() {
    // acá va Chart.js después
  }
}
