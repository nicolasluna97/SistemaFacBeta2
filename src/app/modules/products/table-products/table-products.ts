import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductsService } from '../services/products.service';
import { Observable } from 'rxjs';
import { Product } from '../services/products.service'; // ← Importa Product del servicio


@Component({
  selector: 'table-products',
  imports: [],
  templateUrl: './table-products.html',
  styleUrl: './table-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableProducts {
  productsService = inject(ProductsService);

  // ✅ Deja que TypeScript infiera el tipo automáticamente
  products$ = this.productsService.getProducts();
}