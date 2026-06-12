import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CabinetLayoutComponent } from '../layout/cabinet-layout.component';
import { BookingService } from '../../../core/services/booking.service';
import { BookingSummary, BookingStatus } from '../../../core/models/booking.models';

type FilterKey = 'all' | 'upcoming' | 'completed' | 'cancelled';

const MOCK_BOOKINGS: BookingSummary[] = [
  {
    id: 10428,
    tourId: 1,
    tourTitle: 'Rixos Premium Belek 5★',
    country: 'Туреччина',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&q=80&auto=format&fit=crop',
    durationNights: 7,
    departureDate: '2026-07-12',
    returnDate: '2026-07-19',
    departureCity: 'Київ',
    status: 'PAID',
    totalPrice: 48400,
    discount: 6000,
    touristsCount: 2,
    createdAt: '2026-05-15',
  },
  {
    id: 10510,
    tourId: 2,
    tourTitle: 'Єгипет — Шарм-ель-Шейх. Rixos Premium 5★',
    country: 'Єгипет',
    imageUrl: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=300&q=80&auto=format&fit=crop',
    durationNights: 7,
    departureDate: '2026-08-10',
    returnDate: '2026-08-17',
    departureCity: 'Київ',
    status: 'CONFIRMED',
    totalPrice: 36800,
    discount: 0,
    touristsCount: 2,
    createdAt: '2026-06-01',
  },
  {
    id: 9114,
    tourId: 3,
    tourTitle: 'Atlantis The Palm 5★',
    country: 'ОАЕ',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300&q=80&auto=format&fit=crop',
    durationNights: 7,
    departureDate: '2026-02-03',
    returnDate: '2026-02-10',
    departureCity: 'Київ',
    status: 'COMPLETED',
    totalPrice: 76200,
    discount: 0,
    touristsCount: 2,
    createdAt: '2025-12-10',
  },
  {
    id: 8770,
    tourId: 4,
    tourTitle: 'Steigenberger Alcazar 5★',
    country: 'Єгипет',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&q=80&auto=format&fit=crop',
    durationNights: 8,
    departureDate: '2025-12-18',
    returnDate: '2025-12-26',
    departureCity: 'Київ',
    status: 'CANCELLED',
    totalPrice: 28400,
    discount: 0,
    touristsCount: 2,
    createdAt: '2025-11-05',
  },
  {
    id: 10601,
    tourId: 5,
    tourTitle: 'Греція — Крит. Grecotel Creta Palace 5★',
    country: 'Греція',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=300&q=80&auto=format&fit=crop',
    durationNights: 10,
    departureDate: '2026-09-05',
    returnDate: '2026-09-15',
    departureCity: 'Київ',
    status: 'NEW',
    totalPrice: 62400,
    discount: 0,
    touristsCount: 2,
    createdAt: '2026-06-10',
  },
];

@Component({
  selector: 'app-my-bookings',
  imports: [CommonModule, RouterLink, CabinetLayoutComponent],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss',
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);

  bookings = signal<BookingSummary[]>(MOCK_BOOKINGS);
  loading = signal(false);
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
    this.bookingService.getMyBookings().subscribe({
      next: page => this.bookings.set(page.content),
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
