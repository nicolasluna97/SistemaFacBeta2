import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductsResponse {
  data: Product[];
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface Product {
  id: string;
  title: string;
  stock: number;
  purchasePrice?: number;
  price: number;
  price2: number;
  price3: number;
  price4: number;
  userId: string;
}

  export type PriceKeyNumber = 1 | 2 | 3 | 4;

  export interface DecreaseStockMovementPayload {
    quantity: number;
    customerId: string;
    customerName: string;
    unitPrice: number;
    priceKey: PriceKeyNumber;
  }

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private apiUrl = '/api/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(productData: any): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData);
  }

  updateProduct(id: string, productData: any): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, productData);
  }

  decreaseStock(
    productId: string,
    payload: DecreaseStockMovementPayload
  ): Observable<Product> {
    return this.http.patch<Product>(
      `${this.apiUrl}/${productId}/decrease-stock`,
      payload
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
