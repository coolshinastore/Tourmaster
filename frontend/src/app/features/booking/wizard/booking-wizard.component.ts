import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { TourService } from '../../../core/services/tour.service';
import { BookingService } from '../../../core/services/booking.service';
import { CartService } from '../../../core/services/cart.service';
import { TourDetail, TourDate } from '../../../core/models/tour.models';
import { ExtraService } from '../../../core/models/booking.models';

const MOCK_TOUR: TourDetail = {
  id: 0,
  title: 'Туреччина — Анталія All Inclusive 7 ночей',
  country: 'Туреччина',
  city: 'Анталія',
  hotelName: 'Limak Lara De Luxe Hotel',
  hotelStars: 5,
  mealType: 'AI',
  durationNights: 7,
  priceFrom: 24900,
  rating: 4.9,
  reviewsCount: 312,
  imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
  status: 'ACTIVE',
  description: '',
  galleryUrls: [],
  dates: [
    { id: 1, departureDate: '2025-07-15', returnDate: '2025-07-22', departureCity: 'Київ', totalSeats: 20, availableSeats: 8, price: 24900 },
  ],
  latestReviews: [],
};

@Component({
  selector: 'app-booking-wizard',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Toast],
  templateUrl: './booking-wizard.component.html',
  styleUrl: './booking-wizard.component.scss',
})
export class BookingWizardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);
  private bookingService = inject(BookingService);
  private cartService = inject(CartService);
  private toast = inject(MessageService);

  currentStep = signal(1);
  loading = signal(true);
  submitting = signal(false);
  stepError = signal(false);

  tour = signal<TourDetail | null>(null);
  tourDate = signal<TourDate | null>(null);
  touristsCount = signal(2);
  expandedTourists = signal<Set<number>>(new Set([0]));

  extraServices = signal<ExtraService[]>([]);
  selectedServices = signal<ExtraService[]>([]);

  paymentMethod = signal<'card' | 'apple' | 'installment'>('card');

  touristForms: FormArray = this.fb.array([]);
  paymentForm: FormGroup = this.fb.group({
    cardNumber: ['', [Validators.required]],
    expiry: ['', [Validators.required]],
    cvv: ['', [Validators.required]],
    holder: ['', [Validators.required]],
  });

  readonly steps = [
    { num: 1, label: 'Тур і дати' },
    { num: 2, label: 'Туристи' },
    { num: 3, label: 'Послуги' },
    { num: 4, label: 'Огляд' },
    { num: 5, label: 'Оплата' },
  ];

  basePrice = computed(() => {
    const d = this.tourDate();
    return d ? d.price * this.touristsCount() : 0;
  });

  servicesTotal = computed(() =>
    this.selectedServices().reduce((sum, s) => sum + s.price, 0) * this.touristsCount()
  );

  totalPrice = computed(() => this.basePrice() + this.servicesTotal());

  progressFillPct = computed(() => `${((this.currentStep() - 1) / 4) * 86}%`);

  get todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  get monthlyInstallment(): number {
    return Math.round(this.totalPrice() / 12);
  }

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const tourId = Number(params.get('tourId'));
    const dateId = Number(params.get('dateId'));
    const tourists = Number(params.get('tourists')) || 2;
    this.touristsCount.set(tourists);

    if (tourId) {
      this.tourService.getById(tourId).subscribe({
        next: (detail) => {
          this.tour.set(detail);
          const date = detail.dates?.find(d => d.id === dateId) ?? detail.dates?.[0];
          if (date) this.tourDate.set(date);
          this.buildTouristForms(tourists);
          this.loading.set(false);
        },
        error: () => this.useMock(tourists),
      });
    } else {
      this.useMock(tourists);
    }

    this.bookingService.getExtraServices().subscribe({
      next: s => this.extraServices.set(s),
      error: () => {},
    });
  }

  private useMock(count: number) {
    this.tour.set(MOCK_TOUR);
    this.tourDate.set(MOCK_TOUR.dates[0]);
    this.buildTouristForms(count);
    this.loading.set(false);
  }

  private buildTouristForms(count: number) {
    const groups = Array.from({ length: count }, () =>
      this.fb.group({
        lastName: ['', [Validators.required]],
        firstName: ['', [Validators.required]],
        birthDate: ['', [Validators.required]],
        gender: ['male'],
        passportNumber: ['', [Validators.required]],
        passportExpiry: ['', [Validators.required]],
      })
    );
    this.touristForms = this.fb.array(groups);
    this.expandedTourists.set(new Set([0]));
  }

  get touristFormsArray(): FormGroup[] {
    return (this.touristForms?.controls ?? []) as FormGroup[];
  }

  touristForm(i: number): FormGroup {
    return this.touristForms.at(i) as FormGroup;
  }

  stepStatus(n: number): 'completed' | 'active' | 'pending' {
    const c = this.currentStep();
    return n < c ? 'completed' : n === c ? 'active' : 'pending';
  }

  selectDate(date: TourDate) {
    this.tourDate.set(date);
  }

  incrementCount() {
    if (this.touristsCount() < 9) {
      const n = this.touristsCount() + 1;
      this.touristsCount.set(n);
      this.buildTouristForms(n);
    }
  }

  decrementCount() {
    if (this.touristsCount() > 1) {
      const n = this.touristsCount() - 1;
      this.touristsCount.set(n);
      this.buildTouristForms(n);
    }
  }

  toggleTourist(i: number) {
    const s = new Set(this.expandedTourists());
    s.has(i) ? s.delete(i) : s.add(i);
    this.expandedTourists.set(s);
  }

  isExpanded(i: number): boolean {
    return this.expandedTourists().has(i);
  }

  setGender(form: FormGroup, gender: string) {
    form.patchValue({ gender });
  }

  toggleService(service: ExtraService) {
    const curr = this.selectedServices();
    const exists = curr.some(s => s.id === service.id);
    this.selectedServices.set(exists
      ? curr.filter(s => s.id !== service.id)
      : [...curr, service]
    );
  }

  isServiceSelected(id: number): boolean {
    return this.selectedServices().some(s => s.id === id);
  }

  nextStep() {
    if (this.currentStep() === 2) {
      if (this.touristForms.invalid) {
        this.touristForms.markAllAsTouched();
        this.stepError.set(true);
        const expanded = new Set<number>();
        this.touristFormsArray.forEach((fg, i) => { if (fg.invalid) expanded.add(i); });
        this.expandedTourists.set(expanded);
        return;
      }
    }
    this.stepError.set(false);
    if (this.currentStep() < 5) {
      this.currentStep.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.stepError.set(false);
      this.currentStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  submitBooking() {
    if (this.paymentMethod() === 'card' && this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const tourists = this.touristFormsArray.map(fg => ({
      firstName: fg.value.firstName,
      lastName: fg.value.lastName,
      birthDate: fg.value.birthDate,
      passportNumber: fg.value.passportNumber,
      passportExpiry: fg.value.passportExpiry,
    }));
    this.bookingService.create({
      tourDateId: this.tourDate()!.id,
      tourists,
      extraServiceIds: this.selectedServices().map(s => s.id),
    }).subscribe({
      next: (booking) => {
        this.cartService.clear();
        this.router.navigate(['/booking/success'], { queryParams: { bookingId: booking.id } });
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message ?? 'Не вдалося створити бронювання. Спробуйте ще раз.';
        this.toast.add({ severity: 'error', summary: 'Помилка оплати', detail: msg, life: 6000 });
      },
    });
  }

  formatDate(s?: string): string {
    if (!s) return '';
    return new Date(s).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' });
  }

  formatDateLong(s?: string): string {
    if (!s) return '';
    return new Date(s).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatPrice(n: number): string {
    return n.toLocaleString('uk-UA') + ' ₴';
  }

  mealLabel(meal: string): string {
    return ({ BB: 'Сніданок', HB: 'Напівпансіон', FB: 'Повний пансіон', AI: 'Все включено' } as Record<string, string>)[meal] ?? meal;
  }

  serviceIcon(type: string): string {
    return ({ INSURANCE: '🛡️', TRANSFER: '🚌', EXCURSION: '🏛️' } as Record<string, string>)[type] ?? '✦';
  }

  serviceIconBg(type: string): string {
    return ({ INSURANCE: '#E9F2FB', TRANSFER: '#FFF3EA', EXCURSION: '#F0FDF4' } as Record<string, string>)[type] ?? 'var(--color-bg)';
  }

  touristLabel(count: number): string {
    if (count === 1) return 'дорослий';
    if (count >= 2 && count <= 4) return 'дорослих';
    return 'дорослих';
  }
}
