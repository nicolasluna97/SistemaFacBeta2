export interface CreateMovementDto {
  customerId: string;
  productId: string;
  unitPrice: number;
  priceKey: 1 | 2 | 3 | 4;
  quantity: number;

  // futuro
  status?: string | null;
  employee?: string | null;
}
