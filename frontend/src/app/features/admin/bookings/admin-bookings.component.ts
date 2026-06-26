import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../layout/admin-layout.component';
import { AdminService } from '../../../core/services/admin.service';
import { AdminBooking } from '../../../core/models/admin.models';
import { BookingStatus } from '../../../core/models/booking.models';

const STATUS_ORDER: BookingStatus[] = ['NEW', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED'];

@Component({
  selector: 'app-admin-bookings',
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './admin-bookings.component.html',
  styleUrl: './admin-bookings.component.scss',
})
export class AdminBookingsComponent implements OnInit {
  private adminService = inject(AdminService);

  bookings = signal<AdminBooking[]>([]);
  loading = signal(true);
  searchQuery = signal('');
  filterStatus = signal<BookingStatus | 'ALL'>('ALL');
  editStatusId = signal<number | null>(null);
  editStatusValue = signal<BookingStatus>('NEW');

  readonly statusOptions: BookingStatus[] = STATUS_ORDER;

  filteredBookings = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.bookings().filter(b => {
      const matchQ = !q || b.clientFullName.toLowerCase().includes(q) ||
                     b.tourTitle.toLowerCase().includes(q) ||
                     this.bookingNum(b.id).toLowerCase().includes(q);
      const matchS = this.filterStatus() === 'ALL' || b.status === this.filterStatus();
      return matchQ && matchS;
    });
  });

  ngOnInit() {
    this.loadBookings();
  }

  private loadBookings() {
    this.loading.set(true);
    this.adminService.getBookings().subscribe({
      next: res => {
        this.bookings.set(res.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openEditStatus(b: AdminBooking) {
    this.editStatusId.set(b.id);
    this.editStatusValue.set(b.status);
  }

  confirmStatusChange(id: number) {
    const newStatus = this.editStatusValue();
    this.adminService.updateBookingStatus(id, newStatus).subscribe({
      next: updated => {
        this.bookings.update(list => list.map(b => b.id === id ? { ...b, status: updated.status } : b));
        this.editStatusId.set(null);
      },
      error: () => this.editStatusId.set(null),
    });
  }

  statusConfig(status: BookingStatus): { label: string; bg: string; color: string } {
    const map: Record<BookingStatus, { label: string; bg: string; color: string }> = {
      NEW:       { label: 'Нове',         bg: '#FFFBEB',              color: '#92610A' },
      CONFIRMED: { label: 'Підтверджено', bg: '#E9F2FB',              color: '#15598F' },
      PAID:      { label: 'Оплачено',     bg: 'rgba(34,197,94,.1)',   color: '#157A3C' },
      COMPLETED: { label: 'Завершено',    bg: '#EEF0F3',              color: '#4B5563' },
      CANCELLED: { label: 'Скасовано',    bg: 'rgba(239,68,68,.08)', color: '#B42323' },
    };
    return map[status];
  }

  bookingNum(id: number): string {
    return `TM-${String(id).padStart(5, '0')}`;
  }

  formatPrice(n: number): string {
    return n.toLocaleString('uk-UA') + ' ₴';
  }
}
