import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer style="background: #10243A; color: rgba(255,255,255,.75)" class="pt-12 pb-6">
      <div class="container-app">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">

          <!-- Col 1: Brand -->
          <div class="md:col-span-1">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-lg"
                   style="background: linear-gradient(135deg, #1A6FBF, #0F4570)">T</div>
              <span class="text-white font-black text-xl" style="font-family: 'Nunito Sans', sans-serif">TourMaster</span>
            </div>
            <p class="text-sm leading-relaxed mb-4">
              Ваш надійний партнер у подорожах. Понад 500 турів у найкращих напрямках світу.
            </p>
            <div class="flex gap-3">
              @for (social of socials; track social.icon) {
                <a [href]="social.url" target="_blank"
                   class="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                   style="border: 1px solid rgba(255,255,255,.2)">
                  <i [class]="'pi ' + social.icon + ' text-sm'"></i>
                </a>
              }
            </div>
          </div>

          <!-- Col 2: Tours -->
          <div>
            <h4 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Тури</h4>
            <ul class="flex flex-col gap-2">
              @for (link of tourLinks; track link.label) {
                <li>
                  <a [routerLink]="link.path" class="text-sm hover:text-white transition-colors">
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Col 3: Company -->
          <div>
            <h4 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Компанія</h4>
            <ul class="flex flex-col gap-2">
              @for (link of companyLinks; track link.label) {
                <li>
                  <a [routerLink]="link.path" class="text-sm hover:text-white transition-colors">
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Col 4: Contacts -->
          <div>
            <h4 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Контакти</h4>
            <ul class="flex flex-col gap-3">
              @for (contact of contacts; track contact.label) {
                <li class="flex items-start gap-2 text-sm">
                  <i [class]="'pi ' + contact.icon + ' mt-0.5 shrink-0'" style="color: #F97316"></i>
                  <span>{{ contact.label }}</span>
                </li>
              }
            </ul>
          </div>
        </div>

        <div class="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <span>© 2025 TourMaster. Всі права захищені.</span>
          <div class="flex gap-6">
            <a href="#" class="hover:text-white transition-colors">Політика конфіденційності</a>
            <a href="#" class="hover:text-white transition-colors">Умови використання</a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected socials = [
    { icon: 'pi-facebook', url: '#' },
    { icon: 'pi-instagram', url: '#' },
    { icon: 'pi-telegram', url: '#' },
  ];

  protected tourLinks = [
    { label: 'Гарячі тури', path: '/tours' },
    { label: 'Тури в Туреччину', path: '/tours' },
    { label: 'Тури в Єгипет', path: '/tours' },
    { label: 'Тури в ОАЕ', path: '/tours' },
    { label: 'Тури в Таїланд', path: '/tours' },
  ];

  protected companyLinks = [
    { label: 'Про нас', path: '/about' },
    { label: 'Відгуки', path: '/reviews' },
    { label: 'Контакти', path: '/contacts' },

  ];

  protected contacts = [
    { icon: 'pi-map-marker', label: 'м. Київ, вул. Хрещатик, 1' },
    { icon: 'pi-phone', label: '+380 (44) 123-45-67' },
    { icon: 'pi-envelope', label: 'info@tourmaster.ua' },
    { icon: 'pi-clock', label: 'Пн–Пт: 9:00–18:00' },
  ];
}
