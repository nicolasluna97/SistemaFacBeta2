import type { MovementRange } from '../entities/movement.entity';

export interface GetMovementsDto {
  range: MovementRange;   // '24h' | '7d' | 'all'
  page: number;           // 1..n
  limit: number;          // 20
}
