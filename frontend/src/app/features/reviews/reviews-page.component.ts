import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent }       from '../../shared/components/header/header.component';
import { FooterComponent }       from '../../shared/components/footer/footer.component';
import { MobileTabBarComponent } from '../../shared/components/mobile-tab-bar/mobile-tab-bar.component';
import { TourService } from '../../core/services/tour.service';
import { Review } from '../../core/models/tour.models';

@Component({
  selector: 'app-reviews-page',
  imports: [RouterLink, HeaderComponent, FooterComponent, MobileTabBarComponent],
  template: `
    <app-header />
    <!-- Hero -->
    <section class="relative pt-32 pb-20 overflow-hidden" style="background: linear-gradient(135deg, #0a1628 0%, #10243A 60%, #1a3a5c 100%)">
      <div class="container-app relative z-10 text-center text-white">
        <p class="text-sm font-semibold tracking-widest uppercase mb-4" style="color:#F97316">Думки наших клієнтів</p>
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Відгуки</h1>
        <p class="text-lg text-white/70 max-w-2xl mx-auto">
          Реальні враження тисяч туристів, які вже подорожували разом з TourMaster.
        </p>
      </div>
    </section>

    <!-- Stats bar -->
    <section class="py-10 bg-white border-b" style="border-color:#E2E8F0">
      <div class="container-app">
        <div class="flex flex-wrap justify-center gap-10 text-center">
          @for (s of overallStats; track s.label) {
            <div>
              <div class="text-3xl font-black mb-1" style="color:#F97316">{{ s.value }}</div>
              <div class="text-sm text-gray-500">{{ s.label }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Reviews grid -->
    <section class="py-16" style="background:#F8FAFC">
      <div class="container-app">

        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div class="flex-1">
                    <div class="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                    <div class="h-2 bg-gray-100 rounded w-16"></div>
                  </div>
                </div>
                <div class="h-2 bg-gray-100 rounded mb-2"></div>
                <div class="h-2 bg-gray-100 rounded mb-2 w-5/6"></div>
                <div class="h-2 bg-gray-100 rounded w-4/6"></div>
              </div>
            }
          </div>
        }

        @if (!loading() && reviews().length === 0) {
          <div class="text-center py-20 text-gray-400">
            <i class="pi pi-comment text-5xl mb-4 block"></i>
            <p class="text-lg">Відгуків ще немає</p>
          </div>
        }

        @if (!loading() && reviews().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (review of reviews(); track review.id) {
              <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <!-- Stars -->
                <div class="flex gap-0.5 mb-4">
                  @for (star of starsArray(review.rating); track $index) {
                    <i class="pi pi-star-fill text-sm" style="color:#F59E0B"></i>
                  }
                  @for (star of emptyStars(review.rating); track $index) {
                    <i class="pi pi-star text-sm text-gray-300"></i>
                  }
                </div>

                <!-- Comment -->
                <p class="text-gray-600 text-sm leading-relaxed flex-1 mb-5">&laquo;{{ review.comment }}&raquo;</p>

                <!-- Author -->
                <div class="flex items-center gap-3 pt-4 border-t" style="border-color:#F1F5F9">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style="background: linear-gradient(135deg,#F97316,#FB923C)">
                    {{ review.authorFirstName.charAt(0) }}{{ review.authorLastLetter }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold" style="color:#10243A">
                      {{ review.authorFirstName }} {{ review.authorLastLetter }}.
                    </p>
                    <p class="text-xs text-gray-400">{{ formatDate(review.createdAt) }}</p>
                  </div>
                  <div class="ml-auto">
                    <span class="text-xs font-semibold px-2 py-1 rounded-lg" style="background:#FFF7ED; color:#F97316">
                      ★ {{ review.rating }}.0
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="text-center mt-12">
            <p class="text-gray-500 mb-4">Хочете залишити свій відгук?</p>
            <a routerLink="/cabinet/bookings"
              class="inline-block px-8 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
              style="background:#F97316">
              Перейти до моїх бронювань
            </a>
          </div>
        }
      </div>
    </section>
    <app-footer />
    <app-mobile-tab-bar />
  `,
})
export class ReviewsPageComponent implements OnInit {
  protected reviews = signal<Review[]>([]);
  protected loading = signal(true);

  constructor(private tourService: TourService) {}

  ngOnInit() {
    this.tourService.getLatestReviews(50).subscribe({
      next:  data => { this.reviews.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  protected overallStats = [
    { value: '4.8',   label: 'Середній рейтинг' },
    { value: '12 400+', label: 'Відгуків на сайті' },
    { value: '97%',   label: 'Рекомендують нас' },
    { value: '50k+',  label: 'Задоволених клієнтів' },
  ];

  protected starsArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  protected emptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
