import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { GetMovementsDto } from './dto/get-movements.dto';
import type { MovementsResponse } from './entities/movement.entity';

@Injectable({ providedIn: 'root' })
export class MovementsService {
  private apiUrl = '/api/movements';

  constructor(private http: HttpClient) {}

  getMovements(dto: GetMovementsDto): Observable<MovementsResponse> {
    const params = new HttpParams()
      .set('range', dto.range)
      .set('page', String(dto.page))
      .set('limit', String(dto.limit));

    return this.http.get<MovementsResponse>(this.apiUrl, { params });
  }
}
