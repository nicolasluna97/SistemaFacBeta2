export type MovementRange = '24h' | '7d' | 'all';

export interface Movement {
  id: string;

  customerName: string;
  productTitle: string;

  // precio final vendido
  unitPrice: number;

  // 1|2|3|4
  priceKey: 1 | 2 | 3 | 4;

  // ISO date string desde backend
  createdAt: string;

  // futuro
  status?: string | null;
  employee?: string | null;
}

export interface MovementsResponse {
  data: Movement[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
