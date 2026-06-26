import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../layout/admin-layout.component';
import { AdminService } from '../../../core/services/admin.service';
import { AdminBooking } from '../../../core/models/admin.models';

interface StatCard { label: string; value: string; delta: string; positive: boolean; icon: string; }

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink, AdminLayoutComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  readonly stats: StatCard[] = [
    { label: 'Бронювань цього місяця', value: '148',         delta: '+12% до минулого', positive: true,  icon: '🧳' },
    { label: 'Виручка (червень)',       value: '₴ 1 842 600', delta: '+8% до минулого', positive: true,  icon: '💰' },
    { label: 'Нові клієнти',           value: '37',          delta: '+5 за тиждень',   positive: true,  icon: '👤' },
    { label: 'Скасувань',              value: '6',           delta: '-2 порівняно',     positive: false, icon: '⚠️' },
  ];

  recentBookings = signal<AdminBooking[]>([]);

  readonly topTours = [
    { title: 'Туреччина — Rixos Premium Belek',  bookings: 34, revenue: 1470000 },
    { title: 'Єгипет — Rixos Premium Seagate',   bookings: 28, revenue: 930400  },
    { title: 'ОАЕ — Atlantis The Palm',           bookings: 21, revenue: 1200000 },
    { title: 'Греція — Grecotel Creta Palace',    bookings: 18, revenue: 742000  },
  ];

  ngOnInit() {
    this.adminService.getBookings(undefined, 0, 5).subscribe({
      next: res => this.recentBookings.set(res.content),
      error: () => {},
    });
  }

  statusConfig(status: string): { label: string; bg: string; color: string } {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      NEW:       { label: 'Нове',        bg: '#FFFBEB', color: '#92610A' },
      CONFIRMED: { label: 'Підтверджено', bg: '#E9F2FB', color: '#15598F' },
      PAID:      { label: 'Оплачено',    bg: 'rgba(34,197,94,.1)', color: '#157A3C' },
      COMPLETED: { label: 'Завершено',   bg: '#EEF0F3', color: '#4B5563' },
      CANCELLED: { label: 'Скасовано',   bg: 'rgba(239,68,68,.08)', color: '#B42323' },
    };
    return map[status] ?? { label: status, bg: '#EEF0F3', color: '#4B5563' };
  }

  bookingNum(id: number): string {
    return `TM-${String(id).padStart(5, '0')}`;
  }

  formatPrice(n: number): string {
    return n.toLocaleString('uk-UA') + ' ₴';
  }
}
