import { Component, inject } from '@angular/core';
import { Sidenav } from "../../../core/sidenav/sidenav";
import { Navbar } from '../../../core/navbar/navbar';
import { ProductsService } from '../../products/services/products.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-pages',
  imports: [Sidenav, Navbar, CommonModule],
  templateUrl: './inventory-pages.html',
  styleUrl: './inventory-pages.css'
})

export class InventoryPages {
  productsService = inject(ProductsService);
  products$ = this.productsService.getProducts();
}

