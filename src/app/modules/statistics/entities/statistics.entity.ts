export type StatsMode = 'day' | 'week' | 'month' | 'year';

export interface StatisticsResponse {
  labels: string[];
  values: number[];
  totalAmount?: number;
  totalSales?: number; 
  totalProfit?: number;
  totalProducts?: number;
}
