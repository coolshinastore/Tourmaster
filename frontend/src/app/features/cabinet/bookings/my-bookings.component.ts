import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CabinetLayoutComponent } from '../layout/cabinet-layout.component';
import { BookingService } from '../../../core/services/booking.service';
import { BookingSummary, BookingStatus } from '../../../core/models/booking.models';

type FilterKey = 'all' | 'upcoming' | 'completed' | 'cancelled';

@Component({
  selector: 'app-my-bookings',
  imports: [CommonModule, RouterLink, CabinetLayoutComponent],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss',
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);

  bookings = signal<BookingSummary[]>([]);
  loading = signal(true);
  activeFilter = signal<FilterKey>('all');

  readonly filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'Усі' },
    { key: 'upcoming', label: 'Майбутні' },
    { key: 'completed', label: 'Завершені' },
    { key: 'cancelled', label: 'Скасовані' },
  ];

  filteredBookings = computed(() => {
    const all = this.bookings();
    const now = new Date().toISOString().split('T')[0];
    switch (this.activeFilter()) {
      case 'upcoming':
        return all.filter(b => ['NEW', 'CONFIRMED', 'PAID'].includes(b.status) && b.departureDate >= now);
      case 'completed':
        return all.filter(b => b.status === 'COMPLETED');
      case 'cancelled':
        return all.filter(b => b.status === 'CANCELLED');
      default:
        return all;
    }
  });

  countFor(key: FilterKey): number {
    const all = this.bookings();
    const now = new Date().toISOString().split('T')[0];
    switch (key) {
      case 'upcoming':
        return all.filter(b => ['NEW', 'CONFIRMED', 'PAID'].includes(b.status) && b.departureDate >= now).length;
      case 'completed':
        return all.filter(b => b.status === 'COMPLETED').length;
      case 'cancelled':
        return all.filter(b => b.status === 'CANCELLED').length;
      default:
        return all.length;
    }
  }

  ngOnInit() {
    this.bookingService.getMyBookings(undefined, 0, 50).subscribe({
      next: page => {
        this.bookings.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cancelBooking(id: number) {
    if (!confirm('Скасувати бронювання? Цю дію неможливо відмінити.')) return;
    this.bookingService.cancel(id).subscribe({
      next: () => this.bookings.update(list =>
        list.map(b => b.id === id ? { ...b, status: 'CANCELLED' as BookingStatus } : b)
      ),
      error: () => {},
    });
  }

  statusConfig(status: BookingStatus): { label: string; bg: string; color: string; dot: string } {
    const map: Record<BookingStatus, { label: string; bg: string; color: string; dot: string }> = {
      NEW:       { label: 'Нове',        bg: '#FFFBEB', color: '#92610A', dot: '#F59E0B' },
      CONFIRMED: { label: 'Підтверджено', bg: '#E9F2FB', color: '#15598F', dot: '#1A6FBF' },
      PAID:      { label: 'Оплачено',    bg: 'rgba(34,197,94,.1)', color: '#157A3C', dot: '#22C55E' },
      COMPLETED: { label: 'Завершено',   bg: '#EEF0F3', color: '#4B5563', dot: '#9AA3AF' },
      CANCELLED: { label: 'Скасовано',   bg: 'rgba(239,68,68,.08)', color: '#B42323', dot: '#EF4444' },
    };
    return map[status];
  }

  isCancelled(b: BookingSummary): boolean {
    return b.status === 'CANCELLED';
  }

  isCompleted(b: BookingSummary): boolean {
    return b.status === 'COMPLETED';
  }

  canCancel(b: BookingSummary): boolean {
    return ['NEW', 'CONFIRMED', 'PAID'].includes(b.status);
  }

  bookingNum(id: number): string {
    return `TM-${String(id).padStart(5, '0')}`;
  }

  formatDateRange(dep: string, ret: string): string {
    const d = new Date(dep).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' });
    const r = new Date(ret).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${d}–${r}`;
  }

  formatPrice(n: number): string {
    return n.toLocaleString('uk-UA') + ' ₴';
  }
}
