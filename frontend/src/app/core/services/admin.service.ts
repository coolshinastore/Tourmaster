import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminBooking, AdminClient, AdminTour, SalesReport } from '../models/admin.models';
import { BookingStatus } from '../models/booking.models';
import { PageResponse } from '../models/tour.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getTours(q?: string, status?: string, page = 0, size = 50) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) params = params.set('q', q);
    if (status && status !== 'ALL') params = params.set('status', status);
    return this.http.get<PageResponse<AdminTour>>(`${this.base}/tours`, { params });
  }

  archiveTour(id: number) {
    return this.http.delete<void>(`${this.base}/tours/${id}`);
  }

  getBookings(status?: string, page = 0, size = 50) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status && status !== 'ALL') params = params.set('status', status);
    return this.http.get<PageResponse<AdminBooking>>(`${this.base}/bookings`, { params });
  }

  updateBookingStatus(id: number, status: BookingStatus) {
    return this.http.patch<AdminBooking>(`${this.base}/bookings/${id}/status`, { status, sendNotification: true });
  }

  getClients(q?: string, page = 0, size = 50) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) params = params.set('q', q);
    return this.http.get<PageResponse<AdminClient>>(`${this.base}/clients`, { params });
  }

  getSalesReport(from: string, to: string) {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<SalesReport>(`${this.base}/reports/sales`, { params });
  }
}
