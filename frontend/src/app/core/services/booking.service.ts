import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BookingDetail, BookingSummary, CreateBookingRequest, CreateReviewRequest, ExtraService } from '../models/booking.models';
import { PageResponse } from '../models/tour.models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly api = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  create(request: CreateBookingRequest) {
    return this.http.post<BookingDetail>(this.api, request);
  }

  getMyBookings(status?: string, page = 0, size = 10) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<BookingSummary>>(`${this.api}/my`, { params });
  }

  getById(id: number) {
    return this.http.get<BookingDetail>(`${this.api}/${id}`);
  }

  cancel(id: number) {
    return this.http.post<void>(`${this.api}/${id}/cancel`, {});
  }

  getExtraServices() {
    return this.http.get<ExtraService[]>(`${this.api}/extra-services`);
  }

  createReview(request: CreateReviewRequest) {
    return this.http.post<void>(`${environment.apiUrl}/reviews`, request);
  }

  downloadVoucher(id: number) {
    return this.http.get(`${this.api}/${id}/pdf`, { responseType: 'blob' });
  }
}
