import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../layout/admin-layout.component';

interface AdminClient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bookingsCount: number;
  totalSpent: number;
  registeredAt: string;
  loyaltyLevel: 'BRONZE' | 'SILVER' | 'GOLD';
}

const MOCK_CLIENTS: AdminClient[] = [
  { id: 1, firstName: 'Іван',    lastName: 'Петренко',   email: 'ivan@email.com',   phone: '+380501234567', bookingsCount: 5,  totalSpent: 184000, registeredAt: '2025-01-15', loyaltyLevel: 'GOLD'   },
  { id: 2, firstName: 'Олена',   lastName: 'Коваль',     email: 'olena@email.com',  phone: '+380671234567', bookingsCount: 3,  totalSpent: 98400,  registeredAt: '2025-03-20', loyaltyLevel: 'SILVER' },
  { id: 3, firstName: 'Андрій',  lastName: 'Мороз',      email: 'andrii@email.com', phone: '+380931234567', bookingsCount: 2,  totalSpent: 62400,  registeredAt: '2026-01-10', loyaltyLevel: 'BRONZE' },
  { id: 4, firstName: 'Марія',   lastName: 'Бойко',      email: 'maria@email.com',  phone: '+380501112233', bookingsCount: 7,  totalSpent: 312000, registeredAt: '2024-11-05', loyaltyLevel: 'GOLD'   },
  { id: 5, firstName: 'Сергій',  lastName: 'Лисенко',    email: 'serhii@email.com', phone: '+380677778899', bookingsCount: 1,  totalSpent: 54100,  registeredAt: '2026-02-28', loyaltyLevel: 'BRONZE' },
  { id: 6, firstName: 'Тетяна',  lastName: 'Шевченко',   email: 'tanya@email.com',  phone: '+380931231231', bookingsCount: 4,  totalSpent: 142800, registeredAt: '2025-06-12', loyaltyLevel: 'SILVER' },
  { id: 7, firstName: 'Олексій', lastName: 'Гайда',      email: 'alex@email.com',   phone: '+380507654321', bookingsCount: 6,  totalSpent: 228000, registeredAt: '2024-09-30', loyaltyLevel: 'GOLD'   },
];

@Component({
  selector: 'app-admin-clients',
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './admin-clients.component.html',
  styleUrl: './admin-clients.component.scss',
})
export class AdminClientsComponent {
  clients = signal<AdminClient[]>(MOCK_CLIENTS);
  searchQuery = signal('');
  filterLoyalty = signal<'ALL' | 'GOLD' | 'SILVER' | 'BRONZE'>('ALL');

  filteredClients = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.clients().filter(c => {
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      const matchQ = !q || name.includes(q) || c.email.toLowerCase().includes(q);
      const matchL = this.filterLoyalty() === 'ALL' || c.loyaltyLevel === this.filterLoyalty();
      return matchQ && matchL;
    });
  });

  loyaltyConfig(level: string): { label: string; bg: string; color: string; icon: string } {
    const map: Record<string, { label: string; bg: string; color: string; icon: string }> = {
      GOLD:   { label: 'Золотий',  bg: 'rgba(245,158,11,.12)', color: '#92610A', icon: '🥇' },
      SILVER: { label: 'Срібний',  bg: '#EEF0F3',              color: '#4B5563', icon: '🥈' },
      BRONZE: { label: 'Бронзовий', bg: 'rgba(180,100,50,.1)', color: '#7B3F00', icon: '🥉' },
    };
    return map[level] ?? { label: level, bg: '#EEF0F3', color: '#4B5563', icon: '·' };
  }

  formatPrice(n: number): string {
    return n.toLocaleString('uk-UA') + ' ₴';
  }

  get totalRevenue(): number {
    return this.clients().reduce((s, c) => s + c.totalSpent, 0);
  }
}
