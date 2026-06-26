import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { BookingService } from '../../../core/services/booking.service';
import { BookingDetail } from '../../../core/models/booking.models';

@Component({
  selector: 'app-booking-success',
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './booking-success.component.html',
  styleUrl: './booking-success.component.scss',
})
export class BookingSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  bookingId = signal<string | null>(null);
  booking = signal<BookingDetail | null>(null);
  loading = signal(false);

  ngOnInit() {
    const rawId = this.route.snapshot.queryParamMap.get('bookingId');
    if (!rawId) return;

    const numericId = Number(rawId);
    this.bookingId.set(`TM-${String(rawId).padStart(5, '0')}`);
    this.loading.set(true);

    this.bookingService.getById(numericId).subscribe({
      next: b => { this.booking.set(b); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  formatDate(s?: string): string {
    if (!s) return '';
    return new Date(s).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatPrice(n?: number): string {
    if (n == null) return '';
    return n.toLocaleString('uk-UA') + ' ₴';
  }

  mealLabel(meal?: string): string {
    return ({ BB: 'Сніданок', HB: 'Напівпансіон', FB: 'Повний пансіон', AI: 'All Inclusive' } as Record<string, string>)[meal ?? ''] ?? (meal ?? '');
  }
}
