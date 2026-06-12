import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-booking-success',
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './booking-success.component.html',
  styleUrl: './booking-success.component.scss',
})
export class BookingSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  bookingId = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('bookingId');
    this.bookingId.set(id ? `TM-${String(id).padStart(5, '0')}` : 'TM-00000');
  }
}
