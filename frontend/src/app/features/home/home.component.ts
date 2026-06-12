import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Carousel }    from 'primeng/carousel';
import { Rating }      from 'primeng/rating';
import { InputText }   from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';

import { HeaderComponent }       from '../../shared/components/header/header.component';
import { FooterComponent }       from '../../shared/components/footer/footer.component';
import { MobileTabBarComponent } from '../../shared/components/mobile-tab-bar/mobile-tab-bar.component';
import { TourService }           from '../../core/services/tour.service';
import { TourSummary }           from '../../core/models/tour.models';

interface Slide {
  title: string; subtitle: string; badge: string;
  image: string; price: number; country: string;
}
interface Destination {
  name: string; image: string; toursCount: number; priceFrom: number;
}
interface ReviewItem {
  id: number; author: string; rating: number; text: string; date: string;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule, RouterLink, FormsModule,
    Carousel, Rating, InputText, InputNumber,
    HeaderComponent, FooterComponent, MobileTabBarComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl:    './home.component.scss',
})
export class HomeComponent implements OnInit {
  private tourService = inject(TourService);
  private router      = inject(Router);

  hotTours    = signal<TourSummary[]>([]);
  loadingTours = signal(true);

  search = { destination: '', tourists: 2 };

  carouselResponsive = [
    { breakpoint: '1280px', numVisible: 3, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '640px',  numVisible: 1, numScroll: 1 },
  ];

  slides: Slide[] = [
    {
      title: 'Туреччина — All Inclusive',
      subtitle: 'Розкішний відпочинок на узбережжі Середземного моря',
      badge: '🔥 ХІТ', country: 'Туреччина', price: 24900,
      image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
    },
    {
      title: 'Єгипет — Шарм-ель-Шейх',
      subtitle: 'Кришталеве море і незабутній підводний світ',
      badge: '−20% АКЦІЯ', country: 'Єгипет', price: 18900,
      image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200&q=80',
    },
    {
      title: 'ОАЕ — Дубай',
      subtitle: 'Місто майбутнього: хмарочоси, розкіш і пустеля',
      badge: 'НОВИНКА', country: 'ОАЕ', price: 42500,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    },
    {
      title: 'Греція — Крит',
      subtitle: 'Стародавня культура, оливки та блакитне Егейське море',
      badge: '🔥 ХІТ', country: 'Греція', price: 31200,
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
    },
    {
      title: 'Таїланд — Пхукет',
      subtitle: 'Екзотика, буддійські храми та пляжі Андаманського моря',
      badge: '⏳ ОСТАННІ МІСЦЯ', country: 'Таїланд', price: 38700,
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=80',
    },
  ];

  destinations: Destination[] = [
    { name: 'Туреччина', toursCount: 142, priceFrom: 24900, image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80' },
    { name: 'Єгипет',    toursCount: 87,  priceFrom: 18900, image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&q=80' },
    { name: 'ОАЕ',       toursCount: 56,  priceFrom: 42500, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
    { name: 'Греція',    toursCount: 93,  priceFrom: 31200, image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80' },
    { name: 'Іспанія',   toursCount: 74,  priceFrom: 27800, image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&q=80' },
    { name: 'Таїланд',   toursCount: 48,  priceFrom: 38700, image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80' },
  ];

  reviews: ReviewItem[] = [
    { id: 1, rating: 5, author: 'Марія К.', date: 'Листопад 2024',
      text: 'Чудова агенція! Все організовано бездоганно — від трансферу до готелю. Тур до Туреччини перевершив усі очікування. Обов\'язково повернуся!' },
    { id: 2, rating: 5, author: 'Олег В.', date: 'Жовтень 2024',
      text: 'Дякую менеджеру за чудову підбірку туру в Єгипет. Готель — 5 зірок, харчування відмінне. Сервіс на найвищому рівні!' },
    { id: 3, rating: 4, author: 'Тетяна М.', date: 'Вересень 2024',
      text: 'Перший раз замовляла тур онлайн і дуже задоволена. Зручний сайт, швидка відповідь менеджерів. Тур до Греції був казковим!' },
  ];

  badgeClass(badge: string): string {
    if (badge.includes('ХІТ'))     return 'badge-hit';
    if (badge.includes('АКЦІЯ'))   return 'badge-sale';
    if (badge.includes('НОВИНКА')) return 'badge-new';
    if (badge.includes('ОСТАННІ')) return 'badge-last';
    return 'badge-hit';
  }

  tourBadgeClass(badge?: string): string {
    const map: Record<string, string> = { HIT: 'badge-hit', SALE: 'badge-sale', NEW: 'badge-new', LAST_SEATS: 'badge-last' };
    return badge ? (map[badge] ?? '') : '';
  }

  tourBadgeLabel(badge?: string): string {
    const map: Record<string, string> = { HIT: '🔥 ХІТ', SALE: 'АКЦІЯ', NEW: 'НОВИНКА', LAST_SEATS: '⏳ ОСТАННІ' };
    return badge ? (map[badge] ?? badge) : '';
  }

  onSearch() {
    this.router.navigate(['/tours'], {
      queryParams: {
        ...(this.search.destination ? { country: this.search.destination } : {}),
        tourists: this.search.tourists,
      },
    });
  }

  ngOnInit() {
    this.tourService.getCatalog({ badge: 'HIT', size: 8, sort: 'rating' }).subscribe({
      next: res => { this.hotTours.set(res.content); this.loadingTours.set(false); },
      error: ()  => this.loadingTours.set(false),
    });
  }
}
