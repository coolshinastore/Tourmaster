import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mobile-tab-bar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 flex bg-surface border-t border-line safe-area-bottom"
         style="box-shadow: 0 -4px 12px rgba(16,24,40,.08)">
      @for (tab of tabs; track tab.label) {
        <a [routerLink]="tab.path" routerLinkActive="active-tab"
           [routerLinkActiveOptions]="{ exact: tab.exact }"
           class="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors text-ink-2"
           style="min-width: 44px">
          <i [class]="'pi ' + tab.icon + ' text-xl'"></i>
          <span class="text-[10px] font-medium">{{ tab.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: [`
    .active-tab {
      color: var(--color-primary) !important;
    }
    .safe-area-bottom {
      padding-bottom: env(safe-area-inset-bottom, 0);
    }
  `],
})
export class MobileTabBarComponent {
  private auth = inject(AuthService);

  protected tabs = [
    { icon: 'pi-home',   label: 'Головна',  path: '/',                  exact: true },
    { icon: 'pi-search', label: 'Пошук',    path: '/tours',             exact: false },
    { icon: 'pi-heart',  label: 'Обране',   path: '/cabinet/wishlist',  exact: false },
    { icon: 'pi-user',   label: 'Кабінет',  path: '/cabinet',           exact: false },
  ];
}
