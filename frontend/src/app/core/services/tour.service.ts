import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PageResponse, TourDetail, TourFilter, TourSummary } from '../models/tour.models';

@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly api = `${environment.apiUrl}/tours`;

  constructor(private http: HttpClient) {}

  getCatalog(filter: TourFilter) {
    let params = new HttpParams();
    const f = filter as Record<string, unknown>;
    Object.entries(f).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          val.forEach(v => params = params.append(key, String(v)));
        } else {
          params = params.set(key, String(val));
        }
      }
    });
    return this.http.get<PageResponse<TourSummary>>(this.api, { params });
  }

  getById(id: number) {
    return this.http.get<TourDetail>(`${this.api}/${id}`);
  }

  search(q: string, page = 0, size = 12) {
    return this.http.get<PageResponse<TourSummary>>(`${this.api}/search`, {
      params: new HttpParams().set('q', q).set('page', page).set('size', size),
    });
  }
}
