import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminLayoutComponent } from '../layout/admin-layout.component';
import { AdminService } from '../../../core/services/admin.service';
import { AdminBooking, SalesReport } from '../../../core/models/admin.models';

interface StatCard { label: string; value: string; delta: string; positive: boolean; icon: string; }

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink, AdminLayoutComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  stats = signal<StatCard[]>([]);
  recentBookings = signal<AdminBooking[]>([]);
  topTours = signal<SalesReport['topTours']>([]);
  loadingStats = signal(true);
  monthLabel = signal('');

  ngOnInit() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    this.monthLabel.set(now.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' }));

    forkJoin({
      report: this.adminService.getSalesReport(firstOfMonth, today),
      clients: this.adminService.getClients(undefined, 0, 1),
    }).subscribe({
      next: ({ report, clients }) => {
        const active = report.newBookings + report.confirmedBookings + report.paidBookings;
        const cancelRate = report.totalBookings > 0
          ? Math.round(report.cancelledBookings / report.totalBookings * 100)
          : 0;
        const paidCount = report.paidBookings + report.completedBookings;
        const avgRevenue = paidCount > 0
          ? Math.round(report.totalRevenue / paidCount)
          : 0;

        this.stats.set([
          {
            label: 'Бронювань за місяць',
            value: String(report.totalBookings),
            delta: `активних: ${active}`,
            positive: true,
            icon: '🧳',
          },
          {
            label: `Виручка (${this.monthLabel()})`,
            value: '₴ ' + Math.round(report.totalRevenue).toLocaleString('uk-UA'),
            delta: avgRevenue > 0 ? `~${avgRevenue.toLocaleString('uk-UA')} ₴/бронювання` : 'немає оплачених',
            positive: true,
            icon: '💰',
          },
          {
            label: 'Клієнтів всього',
            value: String(clients.totalElements),
            delta: `завершено турів: ${report.completedBookings}`,
            positive: true,
            icon: '👤',
          },
          {
            label: 'Скасувань за місяць',
            value: String(report.cancelledBookings),
            delta: report.totalBookings > 0 ? `${cancelRate}% від усіх` : 'бронювань ще немає',
            positive: report.cancelledBookings === 0,
            icon: '⚠️',
          },
        ]);
        this.topTours.set(report.topTours.slice(0, 5));
        this.loadingStats.set(false);
      },
      error: () => this.loadingStats.set(false),
    });

    this.adminService.getBookings(undefined, 0, 5).subscribe({
      next: res => this.recentBookings.set(res.content),
      error: () => {},
    });
  }

  statusConfig(status: string): { label: string; bg: string; color: string } {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      NEW:       { label: 'Нове',         bg: '#FFFBEB', color: '#92610A' },
      CONFIRMED: { label: 'Підтверджено', bg: '#E9F2FB', color: '#15598F' },
      PAID:      { label: 'Оплачено',     bg: 'rgba(34,197,94,.1)', color: '#157A3C' },
      COMPLETED: { label: 'Завершено',    bg: '#EEF0F3', color: '#4B5563' },
      CANCELLED: { label: 'Скасовано',    bg: 'rgba(239,68,68,.08)', color: '#B42323' },
    };
    return map[status] ?? { label: status, bg: '#EEF0F3', color: '#4B5563' };
  }

  bookingNum(id: number): string {
    return `TM-${String(id).padStart(5, '0')}`;
  }

  formatPrice(n: number): string {
    return Math.round(n).toLocaleString('uk-UA') + ' ₴';
  }
}
