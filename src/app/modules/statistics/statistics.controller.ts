import { Injectable, inject } from '@angular/core';
import { StatisticsService } from './statistics.service';
import type { GetStatisticsDto } from './dto/get-statistics.dto';

@Injectable({ providedIn: 'root' })
export class StatisticsController {
  private statsSvc = inject(StatisticsService);

  getStatistics(dto: GetStatisticsDto) {
    return this.statsSvc.getStatistics(dto);
  }
}
