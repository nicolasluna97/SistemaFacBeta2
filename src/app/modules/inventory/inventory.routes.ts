import { Routes } from '@angular/router';
import { InventoryPages } from './pages/inventory-pages';

export const inventoryRoutes: Routes = [
  {
    path: '',
    component: InventoryPages
  }
];

export default inventoryRoutes;