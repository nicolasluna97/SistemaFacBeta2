export type StatsMode = 'day' | 'week' | 'month' | 'year';

export interface StatisticsResponse {
  labels: string[];
  values: number[];
  totalAmount?: number; // recaudación neta
  totalSales?: number;  // numero de ventas
}
