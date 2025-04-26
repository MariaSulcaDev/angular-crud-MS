import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../interfaces/api-response';
import { Product, SaveProduct } from '../interfaces/product';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api}/v1/products`;

  getAll(filters?: { name?: string, state?: string, currency_code?: string }) {
    let params = new HttpParams().set('active', 'true');

    // parametros para los filtros
    if (filters) {
      if (filters.name) {
        params = params.set('name', filters.name);
      }
      if (filters.state) {
        params = params.set('state', filters.state);
      }
      if (filters.currency_code) {
        params = params.set('currency_code', filters.currency_code);
      }
    }

    return this.http.get<ApiResponse<Product[]>>(this.baseUrl, { params });
  }

  create(request: SaveProduct) {
    return this.http.post<ApiResponse<Product>>(this.baseUrl, request);
  }

  update(id: number, request: SaveProduct) {
    return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/${id}`, request);
  }

  inactive(id: number) {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}/inactive`);
  }
}
