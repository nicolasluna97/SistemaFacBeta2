import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductsService, Product } from '../../products/services/products.service';
import { Navbar } from '../../../core/navbar/navbar';
import { Sidenav } from '../../../core/sidenav/sidenav';

@Component({
  selector: 'app-inventory-pages',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidenav],
  templateUrl: './inventory-pages.html',
  styleUrls: ['./inventory-pages.css']
})
export class InventoryPages implements OnInit {

  products: Product[] = [];
  editedProducts: Product[] = [];

  loading = false;
  editMode = false;
  deleteMode = false;

  selectedIds = new Set<string>();

  // 🔹 Formulario para agregar (notá que uso `any` para simplificar los null)
  showAddForm = false;
  newProduct: any = {
    title: '',
    stock: null,
    price: null,
    price2: null,
    price3: null,
    price4: null
  };

  // 🔹 Errores para el modal de "Agregar producto"
  newProductErrors = {
    title: '',
    stock: '',
    price: '',
    price2: '',
    price3: '',
    price4: ''
  };

  // 🔹 Errores por fila al editar (key = id del producto)
  editedErrors: {
    [id: string]: {
      title?: string;
      stock?: string;
      price?: string;
      price2?: string;
      price3?: string;
      price4?: string;
    }
  } = {};

  constructor(private productsSvc: ProductsService) {}

  ngOnInit(): void {
    this.load();
  }

  // --------- CARGA ---------
  load() {
    this.loading = true;
    this.productsSvc.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.editedProducts = JSON.parse(JSON.stringify(data));
        this.loading = false;
        this.editedErrors = {};
      },
      error: () => {
        this.loading = false;
        alert('Error al cargar el inventario.');
      }
    });
  }

  // ========= VALIDACIONES COMUNES =========

  private normalizeNumber(value: any): number | 'invalid' {
    if (value === null || value === undefined || value === '') {
      return 0; // campo vacío => 0
    }
    const n = Number(value);
    if (isNaN(n) || n < 0) {
      return 'invalid';
    }
    return n;
  }

  // --------- VALIDAR NUEVO PRODUCTO (MODAL) ---------
  private validateNewProduct(): boolean {
    let valid = true;

    // limpiar errores
    this.newProductErrors = {
      title: '',
      stock: '',
      price: '',
      price2: '',
      price3: '',
      price4: ''
    };

    // título
    const title = (this.newProduct.title || '').trim();
    if (!title) {
      this.newProductErrors.title = 'Se necesita que el producto tenga un título';
      valid = false;
    } else {
      this.newProduct.title = title;
    }

    // helper interno
    const checkField = (field: keyof typeof this.newProductErrors) => {
      const normalized = this.normalizeNumber(this.newProduct[field]);
      if (normalized === 'invalid') {
        this.newProductErrors[field] = 'No se aceptan letras y/o números negativos';
        valid = false;
      } else {
        this.newProduct[field] = normalized;
      }
    };

    checkField('stock');
    checkField('price');
    checkField('price2');
    checkField('price3');
    checkField('price4');

    return valid;
  }

  // --------- VALIDAR PRODUCTOS EDITADOS (TABLA) ---------
  private validateEditedProducts(): boolean {
    let valid = true;
    this.editedErrors = {};

    for (const p of this.editedProducts) {
      const rowErr: any = {};

      // título
      const title = (p.title || '').trim();
      if (!title) {
        rowErr.title = 'Se necesita que el producto tenga un título';
        valid = false;
      } else {
        p.title = title;
      }

      const checkField = (field: 'stock' | 'price' | 'price2' | 'price3' | 'price4') => {
        const value: any = (p as any)[field];
        const normalized = this.normalizeNumber(value);
        if (normalized === 'invalid') {
          rowErr[field] = 'No se aceptan letras y/o números negativos';
          valid = false;
        } else {
          (p as any)[field] = normalized;
        }
      };

      checkField('stock');
      checkField('price');
      checkField('price2');
      checkField('price3');
      checkField('price4');

      if (Object.keys(rowErr).length > 0) {
        this.editedErrors[p.id] = rowErr;
      }
    }

    return valid;
  }

  // --------- FORMULARIO AGREGAR ---------
  openAddForm() {
    this.showAddForm = true;
    // campos numéricos vacíos para no arrancar en "0" visualmente
    this.newProduct = {
      title: '',
      stock: null,
      price: null,
      price2: null,
      price3: null,
      price4: null
    };
    this.newProductErrors = {
      title: '',
      stock: '',
      price: '',
      price2: '',
      price3: '',
      price4: ''
    };
  }

  closeAddForm() {
    this.showAddForm = false;
  }

  saveNewProduct() {
    // 1️⃣ Validar antes de guardar
    if (!this.validateNewProduct()) {
      // si hay errores, se muestran en el modal y no se llama al backend
      return;
    }

    this.loading = true;

    this.productsSvc.createProduct(this.newProduct).subscribe({
      next: (product) => {
        this.loading = false;
        this.showAddForm = false;
        this.products.push(product);
        this.editedProducts = JSON.parse(JSON.stringify(this.products));
        this.editedErrors = {};
      },
      error: (err) => {
        console.error('Error creando producto', err);
        this.loading = false;
        alert('No se pudo crear el producto.');
      }
    });
  }

  // --------- EDITAR ---------
  toggleEditMode() {
    // entrar a modo edición
    if (!this.editMode) {
      this.editedProducts = JSON.parse(JSON.stringify(this.products));
      this.editedErrors = {};
      this.editMode = true;
      return;
    }

    // ya estamos en editMode → queremos guardar
    // 1️⃣ validamos todos los productos
    if (!this.validateEditedProducts()) {
      // si hay errores, NO guardamos ni llamamos backend
      // los errores quedan visibles en la tabla
      return;
    }

    this.loading = true;
    const updates = this.editedProducts.map(p =>
      this.productsSvc.updateProduct(p.id, {
        title: p.title,
        stock: p.stock,
        price: p.price,
        price2: p.price2,
        price3: p.price3,
        price4: p.price4
      })
    );

    Promise.all(updates.map(o => o.toPromise()))
      .then(() => {
        this.editMode = false;
        this.load();
      })
      .catch(err => {
        console.error(err);
        this.loading = false;
        alert('Error al guardar cambios.');
      });
  }

  cancelEdit() {
    this.editMode = false;
    this.editedProducts = JSON.parse(JSON.stringify(this.products));
    this.editedErrors = {};
  }

  // --------- ELIMINAR ---------
  onDeleteButton() {
    if (!this.deleteMode) {
      this.deleteMode = true;
      this.selectedIds.clear();
      return;
    }

    if (this.selectedIds.size === 0) {
      this.deleteMode = false;
      return;
    }

    const count = this.selectedIds.size;
    const msg = count === 1
      ? '¿Seguro que deseas eliminar el producto seleccionado?'
      : `¿Seguro que deseas eliminar ${count} productos?`;

    if (!confirm(msg)) return;

    this.loading = true;
    const ids = Array.from(this.selectedIds);

    Promise.all(ids.map(id => this.productsSvc.deleteProduct(id).toPromise()))
      .then(() => {
        this.loading = false;
        this.deleteMode = false;
        this.selectedIds.clear();
        this.load();
      })
      .catch(err => {
        console.error(err);
        this.loading = false;
        alert('Error al eliminar productos.');
      });
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelected(id: string, checked: boolean) {
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
  }
}