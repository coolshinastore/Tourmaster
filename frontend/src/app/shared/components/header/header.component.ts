import { Component, Input, HostListener, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      [class]="headerClass()"
    >
      <div class="container-app flex items-center justify-between h-16 md:h-18">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2 shrink-0">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-lg"
               style="background: linear-gradient(135deg, #1A6FBF, #0F4570)">T</div>
          <span class="font-black text-xl" style="font-family: 'Nunito Sans', sans-serif"
                [style.color]="solid() ? '#1C1C1E' : '#ffffff'">TourMaster</span>
        </a>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-6">
          @for (link of navLinks; track link.label) {
            <a [routerLink]="link.path"
               class="text-sm font-medium transition-colors hover:text-primary"
               [style.color]="solid() ? '#1C1C1E' : 'rgba(255,255,255,.9)'">
              {{ link.label }}
            </a>
          }
        </nav>

        <!-- Desktop actions -->
        <div class="hidden md:flex items-center gap-3">
          <span class="text-sm font-medium" [style.color]="solid() ? '#6B7280' : 'rgba(255,255,255,.8)'">
            +380 (44) 123-45-67
          </span>

          @if (auth.isLoggedIn()) {
            <a routerLink="/cabinet/wishlist"
               class="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
               [style.color]="solid() ? '#6B7280' : 'rgba(255,255,255,.9)'">
              <i class="pi pi-heart text-lg"></i>
            </a>
            <a routerLink="/cabinet"
               class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
               [class]="solid() ? 'bg-primary-50 text-primary' : 'bg-white/20 text-white'">
              <i class="pi pi-user text-sm"></i>
              {{ auth.user()?.firstName }}
            </a>
          } @else {
            <a routerLink="/auth/login"
               class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors border"
               [class]="solid() ? 'border-line text-ink hover:bg-bg' : 'border-white/40 text-white hover:bg-white/10'">
              Увійти
            </a>
            <a routerLink="/auth/register"
               class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-secondary hover:bg-secondary-600 transition-colors">
              Реєстрація
            </a>
          }
        </div>

        <!-- Mobile burger -->
        <button class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                [style.color]="solid() ? '#1C1C1E' : '#ffffff'"
                (click)="menuOpen.set(!menuOpen())">
          <i [class]="menuOpen() ? 'pi pi-times text-xl' : 'pi pi-bars text-xl'"></i>
        </button>
      </div>

      <!-- Mobile menu -->
      @if (menuOpen()) {
        <div class="md:hidden bg-surface border-t border-line px-6 py-4 flex flex-col gap-4">
          @for (link of navLinks; track link.label) {
            <a [routerLink]="link.path" (click)="menuOpen.set(false)"
               class="text-ink font-medium py-2 border-b border-line last:border-0">
              {{ link.label }}
            </a>
          }
          <div class="flex gap-3 pt-2">
            @if (!auth.isLoggedIn()) {
              <a routerLink="/auth/login" (click)="menuOpen.set(false)"
                 class="flex-1 text-center py-2 rounded-xl border border-line text-ink text-sm font-semibold">
                Увійти
              </a>
              <a routerLink="/auth/register" (click)="menuOpen.set(false)"
                 class="flex-1 text-center py-2 rounded-xl bg-secondary text-white text-sm font-semibold">
                Реєстрація
              </a>
            }
          </div>
        </div>
      }
    </header>
  `,
})
export class HeaderComponent {
  @Input() transparentOnTop = false;

  protected auth = inject(AuthService);

  protected scrollY = signal(0);
  protected menuOpen = signal(false);

  protected solid = computed(() =>
    !this.transparentOnTop || this.scrollY() > 60
  );

  protected headerClass = computed(() =>
    this.solid()
      ? 'bg-surface shadow-sm'
      : 'bg-transparent'
  );

  protected navLinks = [
    { label: 'Гарячі тури', path: '/tours' },
    { label: 'Напрямки',    path: '/tours' },
    { label: 'Готелі',      path: '/tours' },
    { label: 'Про нас',     path: '/' },
    { label: 'Контакти',    path: '/' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrollY.set(window.scrollY);
  }
}
