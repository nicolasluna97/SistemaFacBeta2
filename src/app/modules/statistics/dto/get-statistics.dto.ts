import type { StatsMode } from '../entities/statistics.entity';

export interface GetStatisticsDto {
  mode: StatsMode;
  anchor: string;
}
