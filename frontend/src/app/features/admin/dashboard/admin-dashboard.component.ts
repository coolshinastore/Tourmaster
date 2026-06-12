import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../layout/admin-layout.component';

interface StatCard { label: string; value: string; delta: string; positive: boolean; icon: string; }

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink, AdminLayoutComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  readonly stats: StatCard[] = [
    { label: 'Бронювань цього місяця', value: '148',       delta: '+12% до минулого',  positive: true,  icon: '🧳' },
    { label: 'Виручка (червень)',       value: '₴ 1 842 600', delta: '+8% до минулого', positive: true,  icon: '💰' },
    { label: 'Нові клієнти',           value: '37',        delta: '+5 за тиждень',    positive: true,  icon: '👤' },
    { label: 'Скасувань',              value: '6',         delta: '-2 порівняно',      positive: false, icon: '⚠️' },
  ];

  readonly recentBookings = [
    { id: 10628, client: 'Іван Петренко',  tour: 'Туреччина — Rixos Premium Belek',   date: '2026-07-12', status: 'PAID',      total: 48400 },
    { id: 10615, client: 'Олена Коваль',   tour: 'Єгипет — Rixos Premium Seagate',    date: '2026-08-05', status: 'CONFIRMED', total: 36800 },
    { id: 10601, client: 'Андрій Мороз',   tour: 'Греція — Grecotel Creta Palace',    date: '2026-09-05', status: 'NEW',       total: 62400 },
    { id: 10598, client: 'Марія Бойко',    tour: 'ОАЕ — Atlantis The Palm',           date: '2026-06-28', status: 'CONFIRMED', total: 76200 },
    { id: 10581, client: 'Сергій Лисенко', tour: 'Таїланд — Anantara Kihavah',        date: '2026-07-20', status: 'CANCELLED', total: 54100 },
  ];

  readonly topTours = [
    { title: 'Туреччина — Rixos Premium Belek',  bookings: 34, revenue: 1470000 },
    { title: 'Єгипет — Rixos Premium Seagate',   bookings: 28, revenue: 930400  },
    { title: 'ОАЕ — Atlantis The Palm',           bookings: 21, revenue: 1200000 },
    { title: 'Греція — Grecotel Creta Palace',    bookings: 18, revenue: 742000  },
  ];

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
