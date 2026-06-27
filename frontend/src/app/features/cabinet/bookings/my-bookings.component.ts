import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CabinetLayoutComponent } from '../layout/cabinet-layout.component';
import { BookingService } from '../../../core/services/booking.service';
import { BookingSummary, BookingStatus } from '../../../core/models/booking.models';

type FilterKey = 'all' | 'upcoming' | 'completed' | 'cancelled';

@Component({
  selector: 'app-my-bookings',
  imports: [CommonModule, RouterLink, FormsModule, CabinetLayoutComponent],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss',
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);

  bookings = signal<BookingSummary[]>([]);
  loading = signal(true);
  activeFilter = signal<FilterKey>('all');

  // ── Review modal ─────────────────────────────────────────
  reviewBooking = signal<BookingSummary | null>(null);
  reviewRating = signal(0);
  reviewHover = signal(0);
  reviewComment = signal('');
  reviewSubmitting = signal(false);
  reviewError = signal('');
  reviewedIds = signal<Set<number>>(new Set());

  readonly filters: { key: FilterKey; label: string }[] = [
    { key: 'all',       label: 'Усі' },
    { key: 'upcoming',  label: 'Майбутні' },
    { key: 'completed', label: 'Завершені' },
    { key: 'cancelled', label: 'Скасовані' },
  ];

  readonly stars = [1, 2, 3, 4, 5];

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

  // ── Voucher download ─────────────────────────────────────
  downloadVoucher(b: BookingSummary) {
    this.bookingService.downloadVoucher(b.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voucher-TM-${String(b.id).padStart(5, '0')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {},
    });
  }

  // ── Review modal ─────────────────────────────────────────
  openReview(booking: BookingSummary) {
    this.reviewBooking.set(booking);
    this.reviewRating.set(0);
    this.reviewHover.set(0);
    this.reviewComment.set('');
    this.reviewError.set('');
  }

  closeReview() {
    this.reviewBooking.set(null);
  }

  starClass(star: number): string {
    const active = this.reviewHover() || this.reviewRating();
    return star <= active ? 'star-active' : 'star-empty';
  }

  submitReview() {
    const booking = this.reviewBooking();
    if (!booking || this.reviewRating() === 0) {
      this.reviewError.set('Оберіть оцінку від 1 до 5 зірок');
      return;
    }
    this.reviewSubmitting.set(true);
    this.reviewError.set('');
    this.bookingService.createReview({
      bookingId: booking.id,
      rating:    this.reviewRating(),
      comment:   this.reviewComment(),
    }).subscribe({
      next: () => {
        this.reviewedIds.update(s => new Set([...s, booking.id]));
        this.reviewSubmitting.set(false);
        this.closeReview();
      },
      error: (err) => {
        this.reviewSubmitting.set(false);
        this.reviewError.set(err?.error?.message ?? 'Не вдалося зберегти відгук. Спробуйте ще раз.');
      },
    });
  }

  isReviewed(b: BookingSummary): boolean {
    return this.reviewedIds().has(b.id);
  }

  // ── Helpers ──────────────────────────────────────────────
  statusConfig(status: BookingStatus): { label: string; bg: string; color: string; dot: string } {
    const map: Record<BookingStatus, { label: string; bg: string; color: string; dot: string }> = {
      NEW:       { label: 'Нове',         bg: '#FFFBEB', color: '#92610A', dot: '#F59E0B' },
      CONFIRMED: { label: 'Підтверджено', bg: '#E9F2FB', color: '#15598F', dot: '#1A6FBF' },
      PAID:      { label: 'Оплачено',     bg: 'rgba(34,197,94,.1)', color: '#157A3C', dot: '#22C55E' },
      COMPLETED: { label: 'Завершено',    bg: '#EEF0F3', color: '#4B5563', dot: '#9AA3AF' },
      CANCELLED: { label: 'Скасовано',    bg: 'rgba(239,68,68,.08)', color: '#B42323', dot: '#EF4444' },
    };
    return map[status];
  }

  isCancelled(b: BookingSummary): boolean { return b.status === 'CANCELLED'; }
  isCompleted(b: BookingSummary): boolean  { return b.status === 'COMPLETED'; }
  canCancel(b: BookingSummary): boolean    { return ['NEW', 'CONFIRMED', 'PAID'].includes(b.status); }

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
