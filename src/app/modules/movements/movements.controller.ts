import { Injectable, inject } from '@angular/core';
import { MovementsService } from './movements.service';
import type { GetMovementsDto } from './dto/get-movements.dto';

@Injectable({ providedIn: 'root' })
export class MovementsController {
  private movementsSvc = inject(MovementsService);

  getMovements(dto: GetMovementsDto) {
    return this.movementsSvc.getMovements(dto);
  }
}
