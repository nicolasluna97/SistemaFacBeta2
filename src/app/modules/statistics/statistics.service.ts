import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { GetStatisticsDto } from './dto/get-statistics.dto';
import type { StatisticsResponse } from './entities/statistics.entity';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private apiUrl = '/api/statistics';

  constructor(private http: HttpClient) {}

  getStatistics(dto: GetStatisticsDto) {
    const params = new HttpParams()
      .set('mode', dto.mode)
      .set('anchor', dto.anchor);

    return this.http.get<StatisticsResponse>(this.apiUrl, { params });
  }
}
