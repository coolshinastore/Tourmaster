import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MobileTabBarComponent } from '../../../shared/components/mobile-tab-bar/mobile-tab-bar.component';
import { TourService } from '../../../core/services/tour.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { TourDetail, TourDate, TourSummary } from '../../../core/models/tour.models';

type TabId = 'description' | 'program' | 'included' | 'reviews';

const MOCK_TOUR: TourDetail = {
  id: 1,
  title: 'Туреччина — Анталія All Inclusive 7 ночей',
  country: 'Туреччина',
  city: 'Анталія',
  hotelName: 'Limak Lara De Luxe Hotel',
  hotelStars: 5,
  mealType: 'AI',
  durationNights: 7,
  priceFrom: 24900,
  oldPrice: 32000,
  badge: 'HIT',
  rating: 4.9,
  reviewsCount: 312,
  imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
  status: 'ACTIVE',
  description:
    'Ласкаво просимо до розкішного відпочинку на узбережжі Анталії! Limak Lara De Luxe Hotel & Resort розташований прямо на піщаному пляжі Лари і пропонує незабутній відпочинок у форматі «Все включено».',
  galleryUrls: [
    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
    'https://images.unsplash.com/photo-1596436208045-d5dc78e5a6a6?w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
  ],
  dates: [
    { id: 1, departureDate: '2025-07-15', returnDate: '2025-07-22', departureCity: 'Київ', totalSeats: 20, availableSeats: 8, price: 24900 },
  ],
  latestReviews: [],
};

@Component({
  selector: 'app-tour-detail',
  imports: [CommonModule, RouterLink, GalleriaModule, HeaderComponent, FooterComponent, MobileTabBarComponent],
  templateUrl: './tour-detail.component.html',
  styleUrl: './tour-detail.component.scss',
})
export class TourDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tourService = inject(TourService);
  private userService = inject(UserService);
  private auth = inject(AuthService);

  tour = signal<TourDetail | null>(null);
  loading = signal(true);
  activeTab = signal<TabId>('description');
  selectedDate = signal<TourDate | null>(null);
  touristCount = signal(2);
  inWishlist = signal(false);
  wishlistLoading = signal(false);
  similarTours = signal<TourSummary[]>([]);

  galleryVisible = false;
  galleryActiveIndex = 0;

  galleryImages = computed(() =>
    (this.tour()?.galleryUrls ?? []).map(url => ({
      itemImageSrc: url,
      thumbnailImageSrc: url.split('?')[0] + '?w=120&q=60',
    }))
  );

  pricePerPerson = computed(() => this.selectedDate()?.price ?? this.tour()?.priceFrom ?? 0);
  totalPrice = computed(() => this.pricePerPerson() * this.touristCount());

  readonly tabs: { id: TabId; label: string }[] = [
    { id: 'description', label: 'Опис' },
    { id: 'program', label: 'Програма' },
    { id: 'included', label: 'Включено / ні' },
    { id: 'reviews', label: 'Відгуки' },
  ];

  readonly programDays = [
    { day: 1, title: 'Переліт та заселення', text: 'Виліт із Києва до Анталії. Трансфер до готелю Limak Lara De Luxe. Заселення та ознайомлення з готелем. Вечеря в ресторані. Вільний час.' },
    { day: 2, title: 'Відпочинок на пляжі', text: 'Сніданок у головному ресторані. Цілий день відпочинку на власному піщаному пляжі. Скористайтеся аквапарком з 17 гірками або спа-центром. Вечірня анімаційна програма.' },
    { day: 3, title: 'Вільний день', text: 'Вільний день. За бажанням — екскурсія до стародавнього міста Сіде (доплата). Сніданок, обід і вечеря за системою All Inclusive.' },
    { day: 4, title: 'Вільний день', text: 'Повністю вільний день. Відпочинок на пляжі або в басейнах готелю. Можна відвідати тенісний корт або фітнес-центр. Харчування AI.' },
    { day: 5, title: 'Вільний день', text: 'Вільний день. Можна замовити екскурсію на яхті вздовж узбережжя (доплата). Ввечері — гала-вечеря з живою музикою.' },
    { day: 6, title: 'Останній день відпочинку', text: 'Вільний день. Насолоджуйтеся останніми годинами відпочинку. Збирання валіз. Прощальна вечеря в готелі.' },
    { day: 7, title: 'Виїзд', text: 'Сніданок. Виїзд із готелю. Трансфер до аеропорту Анталія. Зворотний рейс до Києва. Приємних спогадів!' },
  ];

  readonly includedItems = [
    'Авіаперельоти Київ — Анталія — Київ',
    'Розміщення у готелі 5★ (7 ночей)',
    'Харчування All Inclusive',
    'Трансфер аеропорт — готель — аеропорт',
    'Медична страховка',
    'Супровід TourMaster',
  ];

  readonly excludedItems = [
    'Реєстраційний збір (12 USD, сплачується на місці)',
    'Додаткові екскурсії',
    'Мінібар у номері',
    'Алкоголь преміум класу',
    'Особисті витрати',
    'Чайові персоналу',
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.tourService.getById(id).subscribe({
      next: tour => {
        this.tour.set(tour);
        if (tour.dates?.length) this.selectedDate.set(tour.dates[0]);
        this.loading.set(false);
        this.loadSimilarTours(tour.country, tour.id);
      },
      error: () => {
        this.tour.set(MOCK_TOUR);
        this.selectedDate.set(MOCK_TOUR.dates[0]);
        this.loading.set(false);
      },
    });

    if (this.auth.isLoggedIn()) {
      this.userService.getWishlist().subscribe({
        next: items => this.inWishlist.set(items.some(t => t.id === id)),
        error: () => {},
      });
    }
  }

  private loadSimilarTours(country: string, excludeId: number) {
    this.tourService.getCatalog({ country, size: 4 }).subscribe({
      next: res => this.similarTours.set(res.content.filter(t => t.id !== excludeId).slice(0, 3)),
      error: () => {},
    });
  }

  toggleWishlist() {
    const tourId = this.tour()?.id;
    if (!tourId) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.wishlistLoading.set(true);
    if (this.inWishlist()) {
      this.userService.removeFromWishlist(tourId).subscribe({
        next: () => { this.inWishlist.set(false); this.wishlistLoading.set(false); },
        error: () => this.wishlistLoading.set(false),
      });
    } else {
      this.userService.addToWishlist(tourId).subscribe({
        next: () => { this.inWishlist.set(true); this.wishlistLoading.set(false); },
        error: () => this.wishlistLoading.set(false),
      });
    }
  }

  openGallery(index: number) {
    this.galleryActiveIndex = index;
    this.galleryVisible = true;
  }

  incrementTourists() {
    if (this.touristCount() < 10) this.touristCount.update(n => n + 1);
  }

  decrementTourists() {
    if (this.touristCount() > 1) this.touristCount.update(n => n - 1);
  }

  selectDate(date: TourDate) {
    this.selectedDate.set(date);
  }

  book() {
    const d = this.selectedDate();
    const t = this.tour();
    if (!d || !t) return;
    this.router.navigate(['/booking'], { queryParams: { tourId: t.id, dateId: d.id, tourists: this.touristCount() } });
  }

  starsOf(n: number): number[] {
    return Array(Math.round(n)).fill(0);
  }

  emptyStars(n: number): number[] {
    return Array(5 - Math.round(n)).fill(0);
  }

  formatPrice(n: number): string {
    return n.toLocaleString('uk-UA') + ' ₴';
  }

  formatDate(s: string): string {
    return new Date(s).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' });
  }

  mealLabel(meal: string): string {
    const map: Record<string, string> = { BB: 'Сніданок', HB: 'Напівпансіон', FB: 'Повний пансіон', AI: 'Все включено' };
    return map[meal] ?? meal;
  }

  badgeClass(badge?: string): string {
    const map: Record<string, string> = { HIT: 'badge-hit', SALE: 'badge-sale', NEW: 'badge-new', LAST_SEATS: 'badge-last' };
    return badge ? (map[badge] ?? '') : '';
  }

  badgeLabel(badge?: string): string {
    const map: Record<string, string> = { HIT: '🔥 ХІТ', SALE: 'АКЦІЯ', NEW: 'НОВИНКА', LAST_SEATS: '⏳ ОСТАННІ' };
    return badge ? (map[badge] ?? badge) : '';
  }
}
