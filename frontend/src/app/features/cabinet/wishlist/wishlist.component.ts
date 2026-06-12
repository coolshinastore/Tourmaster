import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CabinetLayoutComponent } from '../layout/cabinet-layout.component';
import { TourSummary } from '../../../core/models/tour.models';

const MOCK_WISHLIST: TourSummary[] = [
  {
    id: 1, title: 'Туреччина — Анталія. Limak Lara 5★', country: 'Туреччина', city: 'Анталія',
    hotelName: 'Limak Lara De Luxe', hotelStars: 5, mealType: 'AI', durationNights: 7,
    priceFrom: 24900, oldPrice: 32000, badge: 'HIT', rating: 4.9, reviewsCount: 312,
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&q=80&auto=format&fit=crop',
    status: 'ACTIVE',
  },
  {
    id: 2, title: 'Єгипет — Шарм. Rixos Premium 5★', country: 'Єгипет', city: 'Шарм-ель-Шейх',
    hotelName: 'Rixos Premium Seagate', hotelStars: 5, mealType: 'AI', durationNights: 7,
    priceFrom: 18900, oldPrice: 24000, badge: 'SALE', rating: 4.8, reviewsCount: 187,
    imageUrl: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=400&q=80&auto=format&fit=crop',
    status: 'ACTIVE',
  },
  {
    id: 3, title: 'ОАЕ — Дубай. Atlantis The Palm 5★', country: 'ОАЕ', city: 'Дубай',
    hotelName: 'Atlantis The Palm', hotelStars: 5, mealType: 'BB', durationNights: 7,
    priceFrom: 42500, badge: 'NEW', rating: 4.9, reviewsCount: 94,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80&auto=format&fit=crop',
    status: 'ACTIVE',
  },
  {
    id: 4, title: 'Греція — Крит. Grecotel Creta Palace 5★', country: 'Греція', city: 'Іракліон',
    hotelName: 'Grecotel Creta Palace', hotelStars: 5, mealType: 'HB', durationNights: 10,
    priceFrom: 31200, badge: 'HIT', rating: 4.8, reviewsCount: 224,
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80&auto=format&fit=crop',
    status: 'ACTIVE',
  },
];

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterLink, CabinetLayoutComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent {
  wishlist = signal<TourSummary[]>(MOCK_WISHLIST);

  removeFromWishlist(id: number) {
    this.wishlist.update(items => items.filter(t => t.id !== id));
  }

  badgeLabel(badge?: string): string {
    return ({ HIT: '🔥 ХІТ', SALE: 'АКЦІЯ', NEW: 'НОВИНКА', LAST_SEATS: '⏳ ОСТАННІ' } as Record<string, string>)[badge ?? ''] ?? badge ?? '';
  }

  badgeClass(badge?: string): string {
    return ({ HIT: 'badge-hit', SALE: 'badge-sale', NEW: 'badge-new', LAST_SEATS: 'badge-last' } as Record<string, string>)[badge ?? ''] ?? '';
  }

  mealLabel(meal: string): string {
    return ({ BB: 'Сніданок', HB: 'Напівпансіон', FB: 'Повний пансіон', AI: 'All Inclusive' } as Record<string, string>)[meal] ?? meal;
  }

  formatPrice(n: number): string {
    return n.toLocaleString('uk-UA') + ' ₴';
  }

  starsOf(n: number): number[] {
    return Array(Math.round(n)).fill(0);
  }
}
