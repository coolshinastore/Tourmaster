import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../layout/admin-layout.component';

interface AdminTour {
  id: number;
  title: string;
  country: string;
  hotelStars: number;
  priceFrom: number;
  durationNights: number;
  status: 'ACTIVE' | 'ARCHIVED';
  bookingsCount: number;
  badge?: string;
}

const MOCK_TOURS: AdminTour[] = [
  { id: 1, title: 'Туреччина — Rixos Premium Belek 5★',    country: 'Туреччина', hotelStars: 5, priceFrom: 24900, durationNights: 7,  status: 'ACTIVE',   bookingsCount: 34, badge: 'HIT' },
  { id: 2, title: 'Єгипет — Rixos Premium Seagate 5★',      country: 'Єгипет',    hotelStars: 5, priceFrom: 18900, durationNights: 7,  status: 'ACTIVE',   bookingsCount: 28, badge: 'SALE' },
  { id: 3, title: 'ОАЕ — Atlantis The Palm 5★',             country: 'ОАЕ',       hotelStars: 5, priceFrom: 42500, durationNights: 7,  status: 'ACTIVE',   bookingsCount: 21, badge: 'NEW' },
  { id: 4, title: 'Греція — Grecotel Creta Palace 5★',       country: 'Греція',    hotelStars: 5, priceFrom: 31200, durationNights: 10, status: 'ACTIVE',   bookingsCount: 18, badge: 'HIT' },
  { id: 5, title: 'Таїланд — Anantara Kihavah Maldives 5★', country: 'Таїланд',   hotelStars: 5, priceFrom: 54000, durationNights: 10, status: 'ACTIVE',   bookingsCount: 15 },
  { id: 6, title: 'Мальдіви — Soneva Jani 5★',              country: 'Мальдіви',  hotelStars: 5, priceFrom: 98000, durationNights: 7,  status: 'ARCHIVED', bookingsCount: 7  },
  { id: 7, title: 'Іспанія — Gran Meliá Palacio de Isora',   country: 'Іспанія',   hotelStars: 5, priceFrom: 28400, durationNights: 8,  status: 'ACTIVE',   bookingsCount: 11 },
];

@Component({
  selector: 'app-admin-tours',
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './admin-tours.component.html',
  styleUrl: './admin-tours.component.scss',
})
export class AdminToursComponent {
  tours = signal<AdminTour[]>(MOCK_TOURS);
  searchQuery = signal('');
  filterStatus = signal<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  archiveConfirmId = signal<number | null>(null);

  filteredTours = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.tours().filter(t => {
      const matchQ = !q || t.title.toLowerCase().includes(q) || t.country.toLowerCase().includes(q);
      const matchS = this.filterStatus() === 'ALL' || t.status === this.filterStatus();
      return matchQ && matchS;
    });
  });

  archiveTour(id: number) {
    this.tours.update(list => list.map(t => t.id === id ? { ...t, status: 'ARCHIVED' } : t));
    this.archiveConfirmId.set(null);
  }

  restoreTour(id: number) {
    this.tours.update(list => list.map(t => t.id === id ? { ...t, status: 'ACTIVE' } : t));
  }

  formatPrice(n: number): string {
    return n.toLocaleString('uk-UA') + ' ₴';
  }

  starsOf(n: number): number[] {
    return Array(n).fill(0);
  }
}
