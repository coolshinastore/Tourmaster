import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent }       from '../../shared/components/header/header.component';
import { FooterComponent }       from '../../shared/components/footer/footer.component';
import { MobileTabBarComponent } from '../../shared/components/mobile-tab-bar/mobile-tab-bar.component';

@Component({
  selector: 'app-contacts',
  imports: [FormsModule, HeaderComponent, FooterComponent, MobileTabBarComponent],
  template: `
    <app-header />
    <!-- Hero -->
    <section class="relative pt-32 pb-20 overflow-hidden" style="background: linear-gradient(135deg, #0a1628 0%, #10243A 60%, #1a3a5c 100%)">
      <div class="container-app relative z-10 text-center text-white">
        <p class="text-sm font-semibold tracking-widest uppercase mb-4" style="color:#F97316">Зв'яжіться з нами</p>
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Контакти</h1>
        <p class="text-lg text-white/70 max-w-2xl mx-auto">
          Ми завжди раді відповісти на ваші запитання та допомогти з вибором ідеального туру.
        </p>
      </div>
    </section>

    <!-- Info cards -->
    <section class="py-16 bg-white">
      <div class="container-app">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          @for (info of contactInfo; track info.label) {
            <div class="rounded-2xl p-6 text-center shadow-sm border" style="border-color:#E2E8F0">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style="background:#FFF7ED">
                <i [class]="'pi text-xl ' + info.icon" style="color:#F97316"></i>
              </div>
              <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{{ info.label }}</div>
              @for (line of info.lines; track line) {
                <div class="text-sm font-medium" style="color:#10243A">{{ line }}</div>
              }
            </div>
          }
        </div>

        <!-- Two-column: form + map -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <!-- Contact Form -->
          <div>
            <h2 class="text-2xl font-bold mb-2" style="color:#10243A">Напишіть нам</h2>
            <p class="text-gray-500 mb-8">Відповімо протягом 1 робочого дня.</p>

            @if (sent()) {
              <div class="rounded-2xl p-8 text-center" style="background:#F0FDF4; border:1px solid #BBF7D0">
                <i class="pi pi-check-circle text-4xl mb-3 block" style="color:#16A34A"></i>
                <p class="font-bold text-lg mb-1" style="color:#15803D">Повідомлення надіслано!</p>
                <p class="text-sm text-gray-500">Ми зв'яжемось з вами найближчим часом.</p>
              </div>
            } @else {
              <form (ngSubmit)="submit()" class="flex flex-col gap-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-1" style="color:#374151">Ім'я</label>
                    <input [(ngModel)]="form.name" name="name" required
                      class="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition"
                      style="border-color:#D1D5DB; focus:ring-color:#F97316"
                      placeholder="Іван Петренко">
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1" style="color:#374151">Телефон</label>
                    <input [(ngModel)]="form.phone" name="phone"
                      class="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition"
                      style="border-color:#D1D5DB"
                      placeholder="+380 (__)  ___-__-__">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1" style="color:#374151">Email</label>
                  <input [(ngModel)]="form.email" name="email" type="email" required
                    class="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition"
                    style="border-color:#D1D5DB"
                    placeholder="your@email.com">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1" style="color:#374151">Тема</label>
                  <select [(ngModel)]="form.subject" name="subject"
                    class="w-full border rounded-xl px-4 py-2.5 text-sm outline-none bg-white transition"
                    style="border-color:#D1D5DB; color:#374151">
                    <option value="">Оберіть тему</option>
                    <option>Підбір туру</option>
                    <option>Зміна бронювання</option>
                    <option>Питання щодо оплати</option>
                    <option>Скарга або пропозиція</option>
                    <option>Інше</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1" style="color:#374151">Повідомлення</label>
                  <textarea [(ngModel)]="form.message" name="message" rows="4" required
                    class="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition resize-none"
                    style="border-color:#D1D5DB"
                    placeholder="Опишіть ваше питання..."></textarea>
                </div>
                <button type="submit"
                  class="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style="background:#F97316">
                  Надіслати повідомлення
                </button>
              </form>
            }
          </div>

          <!-- Office info + schedule -->
          <div class="flex flex-col gap-6">
            <div class="rounded-2xl overflow-hidden shadow-sm border" style="border-color:#E2E8F0">
              <!-- Placeholder map -->
              <div class="relative flex items-center justify-center" style="height:220px; background: linear-gradient(135deg,#e8f0fe,#dbeafe)">
                <div class="text-center">
                  <i class="pi pi-map-marker text-5xl mb-2 block" style="color:#F97316"></i>
                  <p class="text-sm font-medium" style="color:#10243A">м. Київ, вул. Хрещатик, 1</p>
                  <p class="text-xs text-gray-400 mt-1">БЦ «Олімпійський», 3 поверх, оф. 312</p>
                </div>
              </div>
              <div class="p-5">
                <h3 class="font-bold mb-3" style="color:#10243A">Наш офіс</h3>
                <p class="text-sm text-gray-600 mb-1">м. Київ, вул. Хрещатик, 1, оф. 312</p>
                <p class="text-sm text-gray-400">Найближче метро: Хрещатик (100 м)</p>
              </div>
            </div>

            <div class="rounded-2xl p-6 border" style="border-color:#E2E8F0">
              <h3 class="font-bold mb-4" style="color:#10243A">Графік роботи</h3>
              @for (day of schedule; track day.days) {
                <div class="flex justify-between py-2 border-b last:border-0 text-sm" style="border-color:#F1F5F9">
                  <span class="text-gray-600">{{ day.days }}</span>
                  <span class="font-medium" [style.color]="day.open ? '#10243A' : '#9CA3AF'">{{ day.hours }}</span>
                </div>
              }
            </div>

            <div class="rounded-2xl p-6 text-white" style="background:#F97316">
              <i class="pi pi-headphones text-2xl mb-3 block"></i>
              <p class="font-bold text-lg mb-1">Гаряча лінія</p>
              <p class="text-white/80 text-sm mb-3">Цілодобова підтримка для клієнтів у дорозі</p>
              <a href="tel:+380441234567" class="font-black text-xl">+380 (44) 123-45-67</a>
            </div>
          </div>
        </div>
      </div>
    </section>
    <app-footer />
    <app-mobile-tab-bar />
  `,
})
export class ContactsComponent {
  protected sent = signal(false);

  protected form = { name: '', phone: '', email: '', subject: '', message: '' };

  protected contactInfo = [
    { icon: 'pi-map-marker', label: 'Адреса',        lines: ['м. Київ, вул. Хрещатик, 1', 'оф. 312, 3 поверх'] },
    { icon: 'pi-phone',      label: 'Телефон',       lines: ['+380 (44) 123-45-67', '+380 (67) 123-45-67'] },
    { icon: 'pi-envelope',   label: 'Email',         lines: ['info@tourmaster.ua', 'booking@tourmaster.ua'] },
    { icon: 'pi-clock',      label: 'Пн–Пт',        lines: ['09:00 — 20:00', 'Сб–Нд: 10:00 — 17:00'] },
  ];

  protected schedule = [
    { days: "Понеділок – П'ятниця", hours: '09:00 – 20:00', open: true },
    { days: 'Субота',               hours: '10:00 – 17:00', open: true },
    { days: 'Неділя',               hours: '10:00 – 15:00', open: true },
  ];

  protected submit() {
    this.sent.set(true);
  }
}
