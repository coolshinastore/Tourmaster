import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminLayoutComponent } from '../layout/admin-layout.component';
import { AdminService } from '../../../core/services/admin.service';
import { AdminTour, TourUpsertRequest } from '../../../core/models/admin.models';

const MEAL_OPTIONS = [
  { value: 'BB',  label: 'BB — Сніданок' },
  { value: 'HB',  label: 'HB — Напівпансіон' },
  { value: 'FB',  label: 'FB — Повний пансіон' },
  { value: 'AI',  label: 'AI — Все включено' },
  { value: 'UAI', label: 'UAI — Ультра все включено' },
];

const BADGE_OPTIONS = [
  { value: '',           label: '— Без бейджа' },
  { value: 'HOT',        label: '🔥 Гарячий' },
  { value: 'NEW',        label: '✨ Новинка' },
  { value: 'LAST_SEATS', label: '⚡ Останні місця' },
  { value: 'SALE',       label: '🏷 Розпродаж' },
];

@Component({
  selector: 'app-admin-tours',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AdminLayoutComponent],
  templateUrl: './admin-tours.component.html',
  styleUrl: './admin-tours.component.scss',
})
export class AdminToursComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  tours = signal<AdminTour[]>([]);
  loading = signal(true);
  searchQuery = signal('');
  filterStatus = signal<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  archiveConfirmId = signal<number | null>(null);

  // ── Form state ──────────────────────────────────────────
  showForm = signal(false);
  editingId = signal<number | null>(null);
  submitting = signal(false);
  submitError = signal('');

  readonly mealOptions = MEAL_OPTIONS;
  readonly badgeOptions = BADGE_OPTIONS;
  readonly starOptions = [1, 2, 3, 4, 5];

  tourForm = this.fb.group({
    title:           ['', [Validators.required, Validators.maxLength(255)]],
    description:     [''],
    country:         ['', [Validators.required, Validators.maxLength(100)]],
    city:            ['', Validators.maxLength(100)],
    hotelName:       ['', Validators.maxLength(255)],
    hotelStars:      [null as number | null],
    mealType:        [''],
    durationNights:  [null as number | null, [Validators.required, Validators.min(1)]],
    priceFrom:       [null as number | null, [Validators.required, Validators.min(1)]],
    oldPrice:        [null as number | null],
    badge:           [''],
    imageUrl:        ['', Validators.maxLength(512)],
    galleryUrlsText: [''],
  });

  filteredTours = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.tours().filter(t => {
      const matchQ = !q || t.title.toLowerCase().includes(q) || t.country.toLowerCase().includes(q);
      const matchS = this.filterStatus() === 'ALL' || t.status === this.filterStatus();
      return matchQ && matchS;
    });
  });

  ngOnInit() {
    this.loadTours();
  }

  private loadTours() {
    this.loading.set(true);
    this.adminService.getTours(undefined, undefined, 0, 100).subscribe({
      next: res => { this.tours.set(res.content); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.tourForm.reset();
    this.editingId.set(null);
    this.submitError.set('');
    this.showForm.set(true);
  }

  openEdit(tour: AdminTour) {
    this.tourForm.reset();
    this.tourForm.patchValue({
      title:      tour.title,
      country:    tour.country,
      hotelName:  tour.hotelName ?? '',
      hotelStars: tour.hotelStars ?? null,
      mealType:   tour.mealType ?? '',
      durationNights: tour.durationNights,
      priceFrom:  tour.priceFrom,
      badge:      tour.badge ?? '',
      imageUrl:   tour.imageUrl ?? '',
    });
    this.editingId.set(tour.id);
    this.submitError.set('');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  submitForm() {
    if (this.tourForm.invalid) {
      this.tourForm.markAllAsTouched();
      return;
    }
    const v = this.tourForm.value;
    const galleryUrls = (v.galleryUrlsText ?? '')
      .split('\n').map(s => s.trim()).filter(Boolean);

    const payload: TourUpsertRequest = {
      title:         v.title!,
      description:   v.description || null,
      country:       v.country!,
      city:          v.city || null,
      hotelName:     v.hotelName || null,
      hotelStars:    v.hotelStars ? Number(v.hotelStars) : null,
      mealType:      v.mealType || null,
      durationNights: Number(v.durationNights!),
      priceFrom:     Number(v.priceFrom!),
      oldPrice:      v.oldPrice ? Number(v.oldPrice) : null,
      badge:         v.badge || null,
      imageUrl:      v.imageUrl || null,
      galleryUrls:   galleryUrls.length ? galleryUrls : null,
    };

    this.submitting.set(true);
    this.submitError.set('');
    const id = this.editingId();
    const req$ = id
      ? this.adminService.updateTour(id, payload)
      : this.adminService.createTour(payload);

    req$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.loadTours();
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.message ?? 'Помилка збереження. Спробуйте ще раз.');
      },
    });
  }

  archiveTour(id: number) {
    this.adminService.archiveTour(id).subscribe({
      next: () => {
        this.tours.update(list => list.map(t => t.id === id ? { ...t, status: 'ARCHIVED' as const } : t));
        this.archiveConfirmId.set(null);
      },
      error: () => this.archiveConfirmId.set(null),
    });
  }

  hasError(controlName: string): boolean {
    const c = this.tourForm.get(controlName);
    return !!(c && c.invalid && c.touched);
  }

  formatPrice(n: number): string {
    return n.toLocaleString('uk-UA') + ' ₴';
  }

  starsOf(n: number): number[] {
    return Array(n).fill(0);
  }
}
