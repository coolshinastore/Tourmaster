import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent }       from '../../shared/components/header/header.component';
import { FooterComponent }       from '../../shared/components/footer/footer.component';
import { MobileTabBarComponent } from '../../shared/components/mobile-tab-bar/mobile-tab-bar.component';

@Component({
  selector: 'app-about',
  imports: [RouterLink, HeaderComponent, FooterComponent, MobileTabBarComponent],
  template: `
    <app-header />
    <!-- Hero -->
    <section class="relative pt-32 pb-20 overflow-hidden" style="background: linear-gradient(135deg, #0a1628 0%, #10243A 60%, #1a3a5c 100%)">
      <div class="container-app relative z-10 text-center text-white">
        <p class="text-sm font-semibold tracking-widest uppercase mb-4" style="color:#F97316">Наша компанія</p>
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Про TourMaster</h1>
        <p class="text-lg text-white/70 max-w-2xl mx-auto">
          З 2010 року ми допомагаємо українцям відкривати світ — безпечно, комфортно і за найкращими цінами.
        </p>
      </div>
    </section>

    <!-- Story -->
    <section class="py-20 bg-white">
      <div class="container-app">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p class="text-sm font-semibold tracking-widest uppercase mb-3" style="color:#F97316">Наша історія</p>
            <h2 class="text-3xl font-bold mb-6" style="color:#10243A">14 років на туристичному ринку України</h2>
            <p class="text-gray-600 mb-4 leading-relaxed">
              TourMaster розпочав роботу у 2010 році як невелике агентство з командою з п'яти ентузіастів-мандрівників. Ми вірили: кожна людина заслуговує на незабутню відпустку без зайвого клопоту.
            </p>
            <p class="text-gray-600 mb-4 leading-relaxed">
              Сьогодні TourMaster — це понад 50 фахівців, партнерство з 200+ готелями в 40 країнах і тисячі задоволених клієнтів щороку. Ми — ліцензований туроператор із власним відділом страхування та цілодобовою підтримкою.
            </p>
            <p class="text-gray-600 leading-relaxed">
              Наша місія — зробити подорожі доступними, безпечними й наповненими яскравими враженнями для кожного.
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            @for (stat of stats; track stat.label) {
              <div class="rounded-2xl p-6 text-center" style="background:#F8FAFC; border:1px solid #E2E8F0">
                <div class="text-3xl font-black mb-1" style="color:#F97316">{{ stat.value }}</div>
                <div class="text-sm text-gray-500 font-medium">{{ stat.label }}</div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- Why Us -->
    <section class="py-20" style="background:#F8FAFC">
      <div class="container-app">
        <div class="text-center mb-12">
          <p class="text-sm font-semibold tracking-widest uppercase mb-3" style="color:#F97316">Переваги</p>
          <h2 class="text-3xl font-bold" style="color:#10243A">Чому обирають нас</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (item of advantages; track item.title) {
            <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background:#FFF7ED">
                <i [class]="'pi text-xl ' + item.icon" style="color:#F97316"></i>
              </div>
              <h3 class="font-bold mb-2" style="color:#10243A">{{ item.title }}</h3>
              <p class="text-sm text-gray-500 leading-relaxed">{{ item.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Licenses -->
    <section class="py-20 bg-white">
      <div class="container-app">
        <div class="text-center mb-12">
          <p class="text-sm font-semibold tracking-widest uppercase mb-3" style="color:#F97316">Документи</p>
          <h2 class="text-3xl font-bold" style="color:#10243A">Ліцензії та сертифікати</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          @for (doc of documents; track doc.title) {
            <div class="rounded-2xl p-6 text-center border" style="border-color:#E2E8F0">
              <i class="pi pi-verified text-3xl mb-3 block" style="color:#F97316"></i>
              <div class="font-bold mb-1" style="color:#10243A">{{ doc.title }}</div>
              <div class="text-xs text-gray-400">{{ doc.number }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20" style="background: linear-gradient(135deg,#10243A,#1a3a5c)">
      <div class="container-app text-center text-white">
        <h2 class="text-3xl font-bold mb-4">Готові до нової пригоди?</h2>
        <p class="text-white/70 mb-8 max-w-xl mx-auto">Оберіть тур зі 100+ напрямків або зателефонуйте — підберемо ідеальний варіант разом.</p>
        <a routerLink="/tours" class="inline-block px-8 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90" style="background:#F97316">
          Переглянути тури
        </a>
      </div>
    </section>
    <app-footer />
    <app-mobile-tab-bar />
  `,
})
export class AboutComponent {
  protected stats = [
    { value: '14+',   label: 'Років досвіду' },
    { value: '50k+',  label: 'Задоволених клієнтів' },
    { value: '40+',   label: 'Країн світу' },
    { value: '200+',  label: 'Готельних партнерів' },
  ];

  protected advantages = [
    { icon: 'pi-shield',      title: 'Офіційний ліцензіат',   desc: 'Ліцензія туроператора та членство в УАТА — повний захист ваших коштів.' },
    { icon: 'pi-headphones',  title: 'Підтримка 24/7',        desc: 'Наші менеджери доступні цілодобово в будь-якій точці маршруту.' },
    { icon: 'pi-tag',         title: 'Найкраща ціна',         desc: 'Прямі контракти з готелями дозволяють пропонувати ціни нижче ринкових.' },
    { icon: 'pi-star',        title: 'Персональний підхід',   desc: 'Підберемо тур під ваші побажання, бюджет і дати подорожі.' },
  ];

  protected documents = [
    { title: 'Ліцензія туроператора', number: '№ АВ 123456 від 15.03.2010' },
    { title: 'Член УАТА',             number: 'Свідоцтво № 2010-UA-0042' },
    { title: 'ISO 9001:2015',         number: 'Сертифікат якості послуг' },
  ];
}
