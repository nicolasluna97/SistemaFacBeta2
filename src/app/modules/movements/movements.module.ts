import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { movementsRoutes } from './movements.routes';

@NgModule({
  imports: [RouterModule.forChild(movementsRoutes)],
})
export class MovementsModule {}
