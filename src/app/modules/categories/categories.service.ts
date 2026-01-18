import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { Category } from './entities/category.entity';
import type { CreateCategoryDto } from './dto/create-category.dto';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly apiUrl = '/api/categories';

  constructor(private readonly http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  createCategory(dto: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, dto);
  }
}
