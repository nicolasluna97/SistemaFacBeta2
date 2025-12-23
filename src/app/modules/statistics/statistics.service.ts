// src/app/modules/statistics/statistics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { GetStatisticsDto } from './dto/get-statistics.dto';
import type { StatisticsResponse } from './entities/statistics.entity';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly apiUrl = '/api/statistics';

  constructor(private readonly http: HttpClient) {}

  getStatistics(dto: GetStatisticsDto) {
    const tzOffsetMinutes = new Date().getTimezoneOffset(); // minutos (local -> UTC)

    const params = new HttpParams()
      .set('mode', dto.mode)
      .set('anchor', dto.anchor)
      .set('tzOffset', String(tzOffsetMinutes));

    return this.http.get<StatisticsResponse>(this.apiUrl, { params });
  }
}
