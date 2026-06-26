import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CabinetLayoutComponent } from '../layout/cabinet-layout.component';
import { UserService } from '../../../core/services/user.service';
import { TourSummary } from '../../../core/models/tour.models';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterLink, CabinetLayoutComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent implements OnInit {
  private userService = inject(UserService);

  wishlist = signal<TourSummary[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.userService.getWishlist().subscribe({
      next: items => {
        this.wishlist.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  removeFromWishlist(id: number) {
    this.userService.removeFromWishlist(id).subscribe({
      next: () => this.wishlist.update(items => items.filter(t => t.id !== id)),
      error: () => {},
    });
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
