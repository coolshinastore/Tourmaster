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

const MOCK_TOURS: TourSummary[] = [
  { id:1,  title:'Туреччина — Анталія All Inclusive 7 ночей',     country:'Туреччина', city:'Анталія',    hotelName:'Limak Lara',          hotelStars:5, mealType:'AI',  durationNights:7,  priceFrom:24900, oldPrice:32000, badge:'HIT',        rating:4.9, reviewsCount:312, imageUrl:'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80', status:'ACTIVE' },
  { id:2,  title:'Єгипет — Шарм-ель-Шейх. Рифи та сонце',        country:'Єгипет',    city:'Шарм-ель-Шейх', hotelName:'Rixos Premium',    hotelStars:5, mealType:'AI',  durationNights:7,  priceFrom:18900, oldPrice:24000, badge:'SALE',       rating:4.8, reviewsCount:187, imageUrl:'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&q=80', status:'ACTIVE' },
  { id:3,  title:'ОАЕ — Дубай. Місто майбутнього та пустеля',     country:'ОАЕ',       city:'Дубай',       hotelName:'Atlantis The Palm',  hotelStars:5, mealType:'BB',  durationNights:5,  priceFrom:42500, badge:'NEW',        rating:4.7, reviewsCount:95,  imageUrl:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', status:'ACTIVE' },
  { id:4,  title:'Греція — Крит. Острів мінойської цивілізації',  country:'Греція',    city:'Іракліон',    hotelName:'Grecotel Creta Palace', hotelStars:5, mealType:'HB', durationNights:10, priceFrom:31200, badge:'HIT',        rating:4.8, reviewsCount:224, imageUrl:'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80', status:'ACTIVE' },
  { id:5,  title:'Іспанія — Барселона. Гауді та пляжі Коста',     country:'Іспанія',   city:'Барселона',   hotelName:'Hotel Arts Barcelona', hotelStars:5, mealType:'BB', durationNights:7,  priceFrom:27800, badge:'NEW',        rating:4.6, reviewsCount:148, imageUrl:'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&q=80', status:'ACTIVE' },
  { id:6,  title:'Таїланд — Пхукет. Екзотика Андаманського моря', country:'Таїланд',   city:'Пхукет',      hotelName:'Anantara Layan',      hotelStars:5, mealType:'HB',  durationNights:14, priceFrom:38700, badge:'LAST_SEATS', rating:4.9, reviewsCount:76,  imageUrl:'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80', status:'ACTIVE' },
  { id:7,  title:'Кіпр — Лімасол. Середземноморський рай',        country:'Кіпр',      city:'Лімасол',     hotelName:'Columbia Beach Resort', hotelStars:4, mealType:'FB', durationNights:7,  priceFrom:22100, oldPrice:27500, badge:'SALE',  rating:4.5, reviewsCount:203, imageUrl:'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=600&q=80', status:'ACTIVE' },
  { id:8,  title:'Мальдіви — Атоль Арі. Бунгало над водою',       country:'Мальдіви',  city:'Атоль Арі',   hotelName:'Constance Moofushi',  hotelStars:5, mealType:'AI',  durationNights:7,  priceFrom:89000, badge:'NEW',        rating:5.0, reviewsCount:42,  imageUrl:'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=80', status:'ACTIVE' },
  { id:9,  title:'Туреччина — Бодрум. Aegean Riviera 5*',         country:'Туреччина', city:'Бодрум',      hotelName:'Bodrum Palace',       hotelStars:5, mealType:'AI',  durationNights:7,  priceFrom:28300, oldPrice:35000, badge:'SALE',  rating:4.7, reviewsCount:156, imageUrl:'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&q=80', status:'ACTIVE' },
  { id:10, title:'Єгипет — Хургада. Коралові рифи Червоного моря',country:'Єгипет',    city:'Хургада',     hotelName:'Steigenberger Aqua Magic', hotelStars:5, mealType:'AI', durationNights:10, priceFrom:16500, badge:'HIT',   rating:4.6, reviewsCount:289, imageUrl:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', status:'ACTIVE' },
  { id:11, title:'Греція — Родос. Рицарський острів та пляжі',    country:'Греція',    city:'Родос',       hotelName:'Sheraton Rhodes Resort', hotelStars:5, mealType:'HB', durationNights:7,  priceFrom:33700, badge:'NEW',       rating:4.7, reviewsCount:118, imageUrl:'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80', status:'ACTIVE' },
  { id:12, title:'Іспанія — Тенеріфе. Вулканічний острів вічного літа', country:'Іспанія', city:'Тенеріфе', hotelName:'Bahía del Duque', hotelStars:5, mealType:'BB', durationNights:10, priceFrom:34500, oldPrice:41000, badge:'SALE', rating:4.8, reviewsCount:97, imageUrl:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', status:'ACTIVE' },
];

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
        this.tours.set(this.applyMockFilters());
        this.totalElements.set(this.applyMockFilters().length);
        this.loading.set(false);
      },
    });
  }

  private applyMockFilters(): TourSummary[] {
    return MOCK_TOURS.filter(t => {
      if (this.filters.countries.length && !this.filters.countries.includes(t.country)) return false;
      if (t.priceFrom < this.filters.priceRange[0] || t.priceFrom > this.filters.priceRange[1]) return false;
      if (this.filters.stars.length && !this.filters.stars.includes(t.hotelStars)) return false;
      if (this.filters.mealTypes.length && !this.filters.mealTypes.includes(t.mealType)) return false;
      if (this.filters.durationNights.length && !this.filters.durationNights.includes(t.durationNights)) return false;
      return true;
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
