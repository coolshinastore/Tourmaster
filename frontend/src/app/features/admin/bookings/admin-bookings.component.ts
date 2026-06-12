import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../layout/admin-layout.component';

type BookingStatus = 'NEW' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';

interface AdminBooking {
  id: number;
  client: string;
  email: string;
  tour: string;
  departureDate: string;
  touristsCount: number;
  total: number;
  status: BookingStatus;
  createdAt: string;
}

const MOCK_BOOKINGS: AdminBooking[] = [
  { id: 10628, client: 'Іван Петренко',   email: 'ivan@email.com',   tour: 'Rixos Premium Belek 5★',    departureDate: '2026-07-12', touristsCount: 2, total: 48400, status: 'PAID',      createdAt: '2026-06-01' },
  { id: 10615, client: 'Олена Коваль',    email: 'olena@email.com',  tour: 'Rixos Premium Seagate 5★',  departureDate: '2026-08-05', touristsCount: 2, total: 36800, status: 'CONFIRMED', createdAt: '2026-06-03' },
  { id: 10601, client: 'Андрій Мороз',    email: 'andrii@email.com', tour: 'Grecotel Creta Palace 5★',  departureDate: '2026-09-05', touristsCount: 4, total: 62400, status: 'NEW',       createdAt: '2026-06-10' },
  { id: 10598, client: 'Марія Бойко',     email: 'maria@email.com',  tour: 'Atlantis The Palm 5★',      departureDate: '2026-06-28', touristsCount: 2, total: 76200, status: 'CONFIRMED', createdAt: '2026-05-28' },
  { id: 10581, client: 'Сергій Лисенко',  email: 'serhii@email.com', tour: 'Anantara Kihavah 5★',       departureDate: '2026-07-20', touristsCount: 2, total: 54100, status: 'CANCELLED', createdAt: '2026-05-20' },
  { id: 10562, client: 'Тетяна Шевченко', email: 'tanya@email.com',  tour: 'Gran Meliá Palacio 5★',     departureDate: '2026-05-10', touristsCount: 2, total: 28400, status: 'COMPLETED', createdAt: '2026-04-01' },
  { id: 10540, client: 'Олексій Гайда',   email: 'alex@email.com',   tour: 'Rixos Premium Belek 5★',    departureDate: '2026-07-05', touristsCount: 3, total: 72600, status: 'PAID',      createdAt: '2026-05-18' },
];

const STATUS_ORDER: BookingStatus[] = ['NEW', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED'];

@Component({
  selector: 'app-admin-bookings',
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './admin-bookings.component.html',
  styleUrl: './admin-bookings.component.scss',
})
export class AdminBookingsComponent {
  bookings = signal<AdminBooking[]>(MOCK_BOOKINGS);
  searchQuery = signal('');
  filterStatus = signal<BookingStatus | 'ALL'>('ALL');
  editStatusId = signal<number | null>(null);
  editStatusValue = signal<BookingStatus>('NEW');

  readonly statusOptions: BookingStatus[] = STATUS_ORDER;

  filteredBookings = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.bookings().filter(b => {
      const matchQ = !q || b.client.toLowerCase().includes(q) || b.tour.toLowerCase().includes(q) ||
                     this.bookingNum(b.id).toLowerCase().includes(q);
      const matchS = this.filterStatus() === 'ALL' || b.status === this.filterStatus();
      return matchQ && matchS;
    });
  });

  openEditStatus(b: AdminBooking) {
    this.editStatusId.set(b.id);
    this.editStatusValue.set(b.status);
  }

  confirmStatusChange(id: number) {
    this.bookings.update(list => list.map(b => b.id === id ? { ...b, status: this.editStatusValue() } : b));
    this.editStatusId.set(null);
  }

  statusConfig(status: BookingStatus): { label: string; bg: string; color: string } {
    const map: Record<BookingStatus, { label: string; bg: string; color: string }> = {
      NEW:       { label: 'Нове',        bg: '#FFFBEB',              color: '#92610A' },
      CONFIRMED: { label: 'Підтверджено', bg: '#E9F2FB',             color: '#15598F' },
      PAID:      { label: 'Оплачено',    bg: 'rgba(34,197,94,.1)',  color: '#157A3C' },
      COMPLETED: { label: 'Завершено',   bg: '#EEF0F3',              color: '#4B5563' },
      CANCELLED: { label: 'Скасовано',   bg: 'rgba(239,68,68,.08)', color: '#B42323' },
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
