import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Slider } from 'primeng/slider';
import { Select } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Drawer } from 'primeng/drawer';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MobileTabBarComponent } from '../../../shared/components/mobile-tab-bar/mobile-tab-bar.component';
import { TourService } from '../../../core/services/tour.service';
import { TourSummary } from '../../../core/models/tour.models';

@Component({
  selector: 'app-tour-catalog',
  imports: [
    CommonModule, RouterLink, FormsModule,
    Slider, Select, Paginator, Drawer,
    HeaderComponent, FooterComponent, MobileTabBarComponent,
  ],
  templateUrl: './tour-catalog.component.html',
  styleUrl: './tour-catalog.component.scss',
})
export class TourCatalogComponent implements OnInit {
  private tourService = inject(TourService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tours = signal<TourSummary[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = 9;
  viewMode = signal<'grid' | 'list'>('grid');
  filtersOpen = false;

  sortOptions = [
    { label: 'За рейтингом', value: 'rating' },
    { label: 'Спочатку дешевші', value: 'price_asc' },
    { label: 'Спочатку дорожчі', value: 'price_desc' },
    { label: 'Тривалість ↑', value: 'duration_asc' },
  ];
  selectedSort = 'rating';

  availableCountries = ['Туреччина', 'Єгипет', 'ОАЕ', 'Греція', 'Іспанія', 'Таїланд', 'Кіпр', 'Мальдіви'];
  mealOptions = [
    { label: 'Сніданок (BB)', value: 'BB' },
    { label: 'Напівпансіон (HB)', value: 'HB' },
    { label: 'Повний пансіон (FB)', value: 'FB' },
    { label: 'Все включено (AI)', value: 'AI' },
  ];
  durationOptions = [3, 5, 7, 10, 14];
  starOptions = [3, 4, 5];

  filters = {
    countries: [] as string[],
    priceRange: [10000, 200000] as [number, number],
    stars: [] as number[],
    mealTypes: [] as string[],
    durationNights: [] as number[],
  };

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const country = params.get('country');
      const badge = params.get('badge');
      if (country) this.filters.countries = [country];
      this.loadTours();
    });
  }

  loadTours() {
    this.loading.set(true);
    const filter = {
      page: this.currentPage(),
      size: this.pageSize,
      sort: this.selectedSort,
      ...(this.filters.countries.length ? { country: this.filters.countries[0] } : {}),
      priceMin: this.filters.priceRange[0],
      priceMax: this.filters.priceRange[1],
      ...(this.filters.stars.length ? { stars: this.filters.stars } : {}),
      ...(this.filters.mealTypes.length ? { mealType: this.filters.mealTypes } : {}),
      ...(this.filters.durationNights.length
        ? { durationMin: Math.min(...this.filters.durationNights), durationMax: Math.max(...this.filters.durationNights) }
        : {}),
    };

    this.tourService.getCatalog(filter).subscribe({
      next: res => {
        this.tours.set(res.content);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.tours.set([]);
        this.totalElements.set(0);
        this.loading.set(false);
      },
    });
  }

  onFilterChange() {
    this.currentPage.set(0);
    this.loadTours();
  }

  onPageChange(event: PaginatorState) {
    this.currentPage.set(event.page ?? 0);
    this.loadTours();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters() {
    this.filters = {
      countries: [],
      priceRange: [10000, 200000],
      stars: [],
      mealTypes: [],
      durationNights: [],
    };
    this.onFilterChange();
  }

  toggleCountry(c: string) {
    const idx = this.filters.countries.indexOf(c);
    if (idx >= 0) this.filters.countries.splice(idx, 1);
    else this.filters.countries.push(c);
    this.onFilterChange();
  }

  toggleStar(n: number) {
    const idx = this.filters.stars.indexOf(n);
    if (idx >= 0) this.filters.stars.splice(idx, 1);
    else this.filters.stars.push(n);
    this.onFilterChange();
  }

  toggleMealType(m: string) {
    const idx = this.filters.mealTypes.indexOf(m);
    if (idx >= 0) this.filters.mealTypes.splice(idx, 1);
    else this.filters.mealTypes.push(m);
    this.onFilterChange();
  }

  toggleDuration(n: number) {
    const idx = this.filters.durationNights.indexOf(n);
    if (idx >= 0) this.filters.durationNights.splice(idx, 1);
    else this.filters.durationNights.push(n);
    this.onFilterChange();
  }

  get activeFiltersCount(): number {
    return (
      this.filters.countries.length +
      this.filters.stars.length +
      this.filters.mealTypes.length +
      this.filters.durationNights.length +
      (this.filters.priceRange[0] > 10000 || this.filters.priceRange[1] < 200000 ? 1 : 0)
    );
  }

  badgeClass(badge?: string): string {
    const map: Record<string, string> = { HIT: 'badge-hit', SALE: 'badge-sale', NEW: 'badge-new', LAST_SEATS: 'badge-last' };
    return badge ? (map[badge] ?? '') : '';
  }

  badgeLabel(badge?: string): string {
    const map: Record<string, string> = { HIT: '🔥 ХІТ', SALE: 'АКЦІЯ', NEW: 'НОВИНКА', LAST_SEATS: '⏳ ОСТАННІ' };
    return badge ? (map[badge] ?? badge) : '';
  }

  skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9];
}
