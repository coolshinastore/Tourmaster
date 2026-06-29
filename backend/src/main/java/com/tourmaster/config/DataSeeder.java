package com.tourmaster.config;

import com.tourmaster.entity.*;
import com.tourmaster.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final TourRepository        tourRepository;
    private final TourDateRepository    tourDateRepository;
    private final BookingRepository     bookingRepository;
    private final ReviewRepository      reviewRepository;
    private final ExtraServiceRepository extraServiceRepository;
    private final ManagerNoteRepository managerNoteRepository;
    private final WishlistRepository    wishlistRepository;

    private static final String MANAGER_PASSWORD = "Manager@2025";
    private static final String CLIENT_PASSWORD  = "Client@2025";

    @Override
    public void run(ApplicationArguments args) {
        seedUsers();
        if (tourRepository.count() == 0) {
            List<Tour>     tours    = seedTours();
            List<TourDate> dates    = seedTourDates(tours);
            List<ExtraService> svcs = extraServiceRepository.findAll();

            User manager = userRepository.findByEmail("manager@tourmaster.ua").orElseThrow();
            User ivan    = userRepository.findByEmail("client@tourmaster.ua").orElseThrow();
            User anna    = userRepository.findByEmail("anna@tourmaster.ua").orElseThrow();
            User mykola  = userRepository.findByEmail("mykola@tourmaster.ua").orElseThrow();
            User olena   = userRepository.findByEmail("olena@tourmaster.ua").orElseThrow();

            List<Booking> completed = seedBookings(ivan, anna, mykola, olena, dates, svcs);
            seedReviews(completed, tours);
            seedWishlist(ivan, anna, mykola, olena, tours);
            seedManagerNotes(ivan, anna, mykola, olena, manager);
            log.info("DataSeeder: demo data seeded (tours, bookings, reviews, wishlist, notes).");
        }
    }

    // ─── USERS ───────────────────────────────────────────────────────────────

    private void seedUsers() {
        List<User> users = List.of(
            User.builder().email("manager@tourmaster.ua")
                .password(passwordEncoder.encode(MANAGER_PASSWORD))
                .firstName("Адмін").lastName("Менеджер")
                .phone("+380991234567").role(Role.MANAGER).loyaltyPoints(0).build(),
            User.builder().email("client@tourmaster.ua")
                .password(passwordEncoder.encode(CLIENT_PASSWORD))
                .firstName("Іван").lastName("Петренко")
                .phone("+380991234568").role(Role.CLIENT).loyaltyPoints(0).build(),
            User.builder().email("anna@tourmaster.ua")
                .password(passwordEncoder.encode(CLIENT_PASSWORD))
                .firstName("Анна").lastName("Коваленко")
                .phone("+380992345679").role(Role.CLIENT).loyaltyPoints(1240).build(),
            User.builder().email("mykola@tourmaster.ua")
                .password(passwordEncoder.encode(CLIENT_PASSWORD))
                .firstName("Микола").lastName("Бондаренко")
                .phone("+380993456780").role(Role.CLIENT).loyaltyPoints(5800).build(),
            User.builder().email("olena@tourmaster.ua")
                .password(passwordEncoder.encode(CLIENT_PASSWORD))
                .firstName("Олена").lastName("Шевченко")
                .phone("+380994567891").role(Role.CLIENT).loyaltyPoints(12500).build()
        );

        int created = 0;
        for (User u : users) {
            if (!userRepository.existsByEmail(u.getEmail())) {
                userRepository.save(u);
                created++;
            }
        }
        if (created > 0) {
            log.info("DataSeeder: created {} user(s). manager@tourmaster.ua / {}", created, MANAGER_PASSWORD);
        }
    }

    // ─── TOURS ───────────────────────────────────────────────────────────────

    private List<Tour> seedTours() {
        List<Tour> tours = List.of(

            tour("Єгипет — Reef Paradise Resort 5*",
                "Незабутній відпочинок на узбережжі Червоного моря. Кришталево чиста вода, " +
                "барвисті корали та розкішний готель зроблять ваш відпочинок ідеальним. " +
                "Безліч розваг для всієї родини: аквапарк, дайвінг-центр, анімаційна програма.",
                "Єгипет", "Шарм-ель-Шейх", "Reef Paradise Resort", 5, "AI", 7,
                "15999", null, "HIT", "4.8", 124,
                "https://picsum.photos/seed/egypt-reef/800/500",
                arr("https://picsum.photos/seed/egypt-reef-1/800/500",
                    "https://picsum.photos/seed/egypt-reef-2/800/500",
                    "https://picsum.photos/seed/egypt-reef-3/800/500",
                    "https://picsum.photos/seed/egypt-reef-4/800/500")),

            tour("Туреччина — Majestic Beach Hotel 5*",
                "Розкішний курорт на узбережжі Середземного моря поблизу Анталії. " +
                "Приватний пляж, п'ять басейнів, різноманітна кухня та спа-центр з хаммамом. " +
                "Ідеально для сімейного відпочинку та романтичних пар.",
                "Туреччина", "Анталія", "Majestic Beach Hotel", 5, "AI", 10,
                "18999", null, "HIT", "4.7", 98,
                "https://picsum.photos/seed/turkey-majestic/800/500",
                arr("https://picsum.photos/seed/turkey-majestic-1/800/500",
                    "https://picsum.photos/seed/turkey-majestic-2/800/500",
                    "https://picsum.photos/seed/turkey-majestic-3/800/500")),

            tour("ОАЕ — Grand Atlantis Hotel 5*",
                "Грандіозний п'ятизірковий готель у серці Дубая на штучному острові Пальм Джумейра. " +
                "Власний аквапарк, приватний пляж і вид на горизонт міста, що вражає уяву. " +
                "Шопінг у найкращих молах світу та екскурсія до оглядового майданчика Бурдж-Халіфа.",
                "ОАЕ", "Дубай", "Grand Atlantis Hotel", 5, "BB", 7,
                "29999", null, "NEW", "4.9", 56,
                "https://picsum.photos/seed/dubai-atlantis/800/500",
                arr("https://picsum.photos/seed/dubai-atlantis-1/800/500",
                    "https://picsum.photos/seed/dubai-atlantis-2/800/500",
                    "https://picsum.photos/seed/dubai-atlantis-3/800/500")),

            tour("Греція — Elysium Resort 4*",
                "Мальовничий острів Крит з багатою античною історією та неповторними пейзажами. " +
                "Пляжі з блакитним прапором, свіжа середземноморська кухня та тепла дружня атмосфера. " +
                "Обов'язкові екскурсії: Кносський палац, ущелина Самарія, місто Ханья.",
                "Греція", "о. Крит", "Elysium Resort", 4, "HB", 8,
                "22499", null, null, "4.6", 89,
                "https://picsum.photos/seed/greece-elysium/800/500",
                arr("https://picsum.photos/seed/greece-elysium-1/800/500",
                    "https://picsum.photos/seed/greece-elysium-2/800/500",
                    "https://picsum.photos/seed/greece-elysium-3/800/500")),

            tour("Іспанія — Catalonia Park Hotel 4*",
                "Незабутня подорож до Барселони — столиці Каталонії та міста генія Антоніо Гауді. " +
                "Сучасний готель у кварталі Ейшампле за два кроки від Пасеїг де Грасія. " +
                "Саграда Фамілія, Парк Гюель, Монжуїк та легендарна Рамбла — все поруч.",
                "Іспанія", "Барселона", "Catalonia Park Hotel", 4, "BB", 5,
                "25999", null, "NEW", "4.5", 42,
                "https://picsum.photos/seed/spain-barcelona/800/500",
                arr("https://picsum.photos/seed/spain-barcelona-1/800/500",
                    "https://picsum.photos/seed/spain-barcelona-2/800/500",
                    "https://picsum.photos/seed/spain-barcelona-3/800/500")),

            tour("Таїланд — Andaman Pearl Resort 5*",
                "Екзотичний відпочинок на острові Пхукет — перлині Андаманського моря. " +
                "Пляжі з білосніжним піском, кришталевий океан та неперевершений тайський сервіс. " +
                "Екскурсії на острови Пхі-Пхі, відвідини слонового табору та традиційний тайський масаж.",
                "Таїланд", "Пхукет", "Andaman Pearl Resort", 5, "AI", 11,
                "34999", null, "HIT", "4.9", 73,
                "https://picsum.photos/seed/thailand-andaman/800/500",
                arr("https://picsum.photos/seed/thailand-andaman-1/800/500",
                    "https://picsum.photos/seed/thailand-andaman-2/800/500",
                    "https://picsum.photos/seed/thailand-andaman-3/800/500",
                    "https://picsum.photos/seed/thailand-andaman-4/800/500")),

            tour("Мальдіви — Sunrise Water Villas 5*",
                "Бунгало над водою в Індійському океані — найромантичніший напрямок на планеті. " +
                "Безмежний океан бірюзового кольору, коралові рифи з черепахами та маntами. " +
                "Снорклінг прямо з веранди, дайвінг на найкращих рифах та захід сонця на дхоні.",
                "Мальдіви", "Атол Арі", "Sunrise Water Villas", 5, "AI", 7,
                "89999", null, null, "5.0", 28,
                "https://picsum.photos/seed/maldives-sunrise/800/500",
                arr("https://picsum.photos/seed/maldives-sunrise-1/800/500",
                    "https://picsum.photos/seed/maldives-sunrise-2/800/500",
                    "https://picsum.photos/seed/maldives-sunrise-3/800/500")),

            tour("Чорногорія — Adriatic Breeze Hotel 4*",
                "Чарівна країна на узбережжі Адріатики з середньовічними містами та чистим гірським повітрям. " +
                "Будва, Котор, Перат та Ловчен — кожне місце відкриє свою неповторну красу. " +
                "Кришталево чисте море, свіжа риба прямо з човна та неймовірні краєвиди.",
                "Чорногорія", "Будва", "Adriatic Breeze Hotel", 4, "HB", 7,
                "16999", "19999", "SALE", "4.4", 67,
                "https://picsum.photos/seed/montenegro-adriatic/800/500",
                arr("https://picsum.photos/seed/montenegro-adriatic-1/800/500",
                    "https://picsum.photos/seed/montenegro-adriatic-2/800/500",
                    "https://picsum.photos/seed/montenegro-adriatic-3/800/500")),

            tour("Кіпр — Aphrodite Hills Resort 4*",
                "Сонячний острів богині Афродіти у Середземному морі. " +
                "Прекрасні пляжі Пафоса, руїни давнього Куріона та місцеві виноробні. " +
                "М'який середземноморський клімат, смачна кіпрська кухня і щиросердна гостинність.",
                "Кіпр", "Пафос", "Aphrodite Hills Resort", 4, "BB", 6,
                "17999", null, null, "4.3", 51,
                "https://picsum.photos/seed/cyprus-aphrodite/800/500",
                arr("https://picsum.photos/seed/cyprus-aphrodite-1/800/500",
                    "https://picsum.photos/seed/cyprus-aphrodite-2/800/500",
                    "https://picsum.photos/seed/cyprus-aphrodite-3/800/500")),

            tour("Болгарія — Black Sea Pearl Hotel 3*",
                "Доступний і якісний відпочинок на Чорному морі для всієї родини. " +
                "Сонячний берег — найпопулярніший курорт Болгарії з розвиненою туристичною інфраструктурою. " +
                "Тепле море, широкий пісчаний пляж, кафе з болгарською кухнею та нічне життя.",
                "Болгарія", "Сонячний берег", "Black Sea Pearl Hotel", 3, "BB", 7,
                "9999", "12999", "SALE", "4.1", 82,
                "https://picsum.photos/seed/bulgaria-blacksea/800/500",
                arr("https://picsum.photos/seed/bulgaria-blacksea-1/800/500",
                    "https://picsum.photos/seed/bulgaria-blacksea-2/800/500",
                    "https://picsum.photos/seed/bulgaria-blacksea-3/800/500"))
        );

        List<Tour> saved = tourRepository.saveAll(tours);
        log.info("DataSeeder: seeded {} tours.", saved.size());
        return saved;
    }

    private Tour tour(String title, String desc,
                      String country, String city, String hotel, int stars,
                      String meal, int nights, String price, String oldPrice,
                      String badge, String rating, int reviewsCount,
                      String img, String[] gallery) {
        return Tour.builder()
            .title(title).description(desc)
            .country(country).city(city).hotelName(hotel).hotelStars((short) stars)
            .mealType(meal).durationNights((short) nights)
            .priceFrom(new BigDecimal(price))
            .oldPrice(oldPrice != null ? new BigDecimal(oldPrice) : null)
            .badge(badge).rating(new BigDecimal(rating)).reviewsCount(reviewsCount)
            .imageUrl(img).galleryUrls(gallery)
            .status(TourStatus.ACTIVE)
            .build();
    }

    private String[] arr(String... urls) { return urls; }

    // ─── TOUR DATES ──────────────────────────────────────────────────────────
    // Each tour gets 4 dates: [0]=past1, [1]=past2, [2]=future1, [3]=future2
    // Access: dates.get(tourIndex * 4 + slot)

    private List<TourDate> seedTourDates(List<Tour> tours) {
        List<TourDate> all = new ArrayList<>();
        LocalDate[] past   = { LocalDate.of(2026, 4, 10), LocalDate.of(2026, 2, 15) };
        LocalDate[] future = { LocalDate.of(2026, 8, 15), LocalDate.of(2026, 10, 5) };

        for (Tour t : tours) {
            int n = t.getDurationNights();
            for (LocalDate dep : past) {
                all.add(tourDateRepository.save(TourDate.builder()
                    .tour(t).departureDate(dep).returnDate(dep.plusDays(n))
                    .departureCity("Київ").totalSeats(30).availableSeats(0).build()));
            }
            for (LocalDate dep : future) {
                all.add(tourDateRepository.save(TourDate.builder()
                    .tour(t).departureDate(dep).returnDate(dep.plusDays(n))
                    .departureCity("Київ").totalSeats(30).availableSeats(18).build()));
            }
        }
        log.info("DataSeeder: seeded {} tour dates.", all.size());
        return all;
    }

    // Shortcut: tourIndex * 4 + slot (0=past1,1=past2,2=future1,3=future2)
    private TourDate d(List<TourDate> dates, int tourIdx, int slot) {
        return dates.get(tourIdx * 4 + slot);
    }

    // ─── BOOKINGS ────────────────────────────────────────────────────────────

    private List<Booking> seedBookings(User ivan, User anna, User mykola, User olena,
                                       List<TourDate> dates, List<ExtraService> svcs) {
        ExtraService insurance = svcs.stream()
            .filter(s -> s.getType() == ExtraServiceType.INSURANCE).findFirst().orElse(null);
        ExtraService transfer = svcs.stream()
            .filter(s -> s.getType() == ExtraServiceType.TRANSFER).findFirst().orElse(null);

        List<Booking> completed = new ArrayList<>();

        // ── Іван Петренко ─────────────────────────────────────────────────
        Booking b1 = save(booking(ivan, d(dates, 0, 0), BookingStatus.COMPLETED,
            "31999", "500", "Клієнт повернувся. Дуже задоволений відпочинком у Єгипті.",
            List.of(item("Іван",    "Петренко", "1990-05-15", "ЄП123456", "2028-05-14"),
                    item("Марія",   "Петренко", "1992-08-22", "ЄП789012", "2028-08-21"))),
            insurance);
        completed.add(b1);

        save(booking(ivan, d(dates, 2, 2), BookingStatus.PAID,
            "29999", "0", null,
            List.of(item("Іван", "Петренко", "1990-05-15", "ЄП123456", "2028-05-14"))),
            transfer);

        save(booking(ivan, d(dates, 4, 2), BookingStatus.CONFIRMED,
            "51998", "0", null,
            List.of(item("Іван",    "Петренко", "1990-05-15", "ЄП123456", "2028-05-14"),
                    item("Олексій", "Петренко", "2015-03-10", "ЄП345678", "2030-03-09"))));

        // ── Анна Коваленко ────────────────────────────────────────────────
        Booking b4 = save(booking(anna, d(dates, 1, 0), BookingStatus.COMPLETED,
            "37998", "400", "Клієнт задоволена. Залишила позитивний відгук.",
            List.of(item("Анна",   "Коваленко", "1988-11-03", "ЄА456789", "2029-11-02"),
                    item("Оксана", "Левченко",  "1990-07-18", "ЄА012345", "2028-07-17"))),
            insurance);
        completed.add(b4);

        save(booking(anna, d(dates, 3, 2), BookingStatus.CONFIRMED,
            "22499", "200", null,
            List.of(item("Анна", "Коваленко", "1988-11-03", "ЄА456789", "2029-11-02"))));

        save(booking(anna, d(dates, 8, 3), BookingStatus.NEW,
            "35998", "0", null,
            List.of(item("Анна",   "Коваленко", "1988-11-03", "ЄА456789", "2029-11-02"),
                    item("Оксана", "Левченко",  "1990-07-18", "ЄА012345", "2028-07-17"))));

        // ── Микола Бондаренко ─────────────────────────────────────────────
        Booking b7 = save(booking(mykola, d(dates, 5, 0), BookingStatus.COMPLETED,
            "34999", "1000", "Золотий клієнт. Знижка 1000 грн за рівнем лояльності.",
            List.of(item("Микола", "Бондаренко", "1985-02-28", "МЄ678901", "2027-02-27"))),
            insurance, transfer);
        completed.add(b7);

        save(booking(mykola, d(dates, 6, 2), BookingStatus.PAID,
            "179998", "3000", "Знижка 3000 грн. VIP бронювання — Мальдіви.",
            List.of(item("Микола",  "Бондаренко", "1985-02-28", "МЄ678901", "2027-02-27"),
                    item("Тетяна",  "Бондаренко", "1987-09-12", "МЄ234567", "2027-09-11"))));

        save(booking(mykola, d(dates, 7, 1), BookingStatus.CANCELLED,
            "16999", "0", "Клієнт скасував через хворобу. Повернуто 80% вартості.",
            List.of(item("Микола", "Бондаренко", "1985-02-28", "МЄ678901", "2027-02-27"))));

        // ── Олена Шевченко ────────────────────────────────────────────────
        Booking b10 = save(booking(olena, d(dates, 9, 0), BookingStatus.COMPLETED,
            "29997", "2000", "Платиновий клієнт. Знижка 2000 грн. Сімейне бронювання — 3 особи.",
            List.of(item("Олена",     "Шевченко", "1980-06-25", "ОЄ901234", "2028-06-24"),
                    item("Дмитро",    "Шевченко", "1978-12-30", "ОЄ567890", "2028-12-29"),
                    item("Катерина",  "Шевченко", "2010-04-15", "ОЄ111222", "2030-04-14"))),
            insurance);
        completed.add(b10);

        save(booking(olena, d(dates, 0, 3), BookingStatus.NEW,
            "31998", "0", null,
            List.of(item("Олена",  "Шевченко", "1980-06-25", "ОЄ901234", "2028-06-24"),
                    item("Дмитро", "Шевченко", "1978-12-30", "ОЄ567890", "2028-12-29"))));

        save(booking(olena, d(dates, 1, 3), BookingStatus.CONFIRMED,
            "37998", "3500", "Знижка 3500 грн — платиновий рівень лояльності.",
            List.of(item("Олена",  "Шевченко", "1980-06-25", "ОЄ901234", "2028-06-24"),
                    item("Дмитро", "Шевченко", "1978-12-30", "ОЄ567890", "2028-12-29"))));


        log.info("DataSeeder: seeded 12 bookings ({} completed).", completed.size());
        return completed;
    }

    private Booking save(Booking b, ExtraService... services) {
        for (ExtraService s : services) {
            if (s != null) b.getExtraServices().add(s);
        }
        return bookingRepository.save(b);
    }

    private Booking booking(User user, TourDate date, BookingStatus status,
                            String price, String discount, String note,
                            List<BookingItem> items) {
        Booking b = Booking.builder()
            .user(user).tourDate(date).status(status)
            .totalPrice(new BigDecimal(price))
            .discount(new BigDecimal(discount))
            .managerNote(note)
            .build();
        items.forEach(i -> { i.setBooking(b); b.getItems().add(i); });
        return b;
    }

    private BookingItem item(String first, String last,
                             String birth, String passport, String expiry) {
        return BookingItem.builder()
            .firstName(first).lastName(last)
            .birthDate(LocalDate.parse(birth))
            .passportNumber(passport)
            .passportExpiry(LocalDate.parse(expiry))
            .build();
    }

    // ─── REVIEWS ─────────────────────────────────────────────────────────────
    // completed[0]=Іван/Єгипет, [1]=Анна/Туреччина,
    // [2]=Микола/Таїланд,       [3]=Олена/Болгарія

    private void seedReviews(List<Booking> completed, List<Tour> tours) {
        record RD(int bIdx, int tIdx, short stars, String comment) {}

        List<RD> list = List.of(
            new RD(0, 0, (short) 5,
                "Чудовий відпочинок! Reef Paradise Resort перевершив усі очікування. " +
                "Персонал надзвичайно уважний, харчування різноманітне і смачне. " +
                "Корали неймовірно красиві — снорклінг щодня! Обов'язково повернемось наступного року."),
            new RD(1, 1, (short) 4,
                "Загалом дуже гарний тур, Majestic Beach Hotel розташований чудово. " +
                "Сніданок міг бути різноманітнішим, але обід та вечеря — на відмінно. " +
                "Аніматори щовечора влаштовували цікаві шоу, басейни великі та чисті. Рекомендую!"),
            new RD(2, 5, (short) 5,
                "Найкраща подорож у моєму житті! Пхукет — це просто неймовірно. " +
                "Andaman Pearl Resort — розкіш і смак у кожній деталі: від номера до ресторанів. " +
                "Екскурсія на острови Пхі-Пхі залишила незабутні враження. " +
                "Вже купуємо тури знову — цього разу подовший заїзд!"),
            new RD(3, 9, (short) 4,
                "Непоганий відпочинок для сімейного бюджету. Black Sea Pearl — " +
                "чистий затишний готель з достатнім харчуванням. Сонячний берег чудово підходить " +
                "для відпочинку з дітьми. Море тепле, пляж широкий. За такою ціною — відмінний вибір!")
        );

        for (RD rd : list) {
            Booking b   = completed.get(rd.bIdx());
            Tour    tour = tours.get(rd.tIdx());
            reviewRepository.save(Review.builder()
                .user(b.getUser()).tour(tour).booking(b)
                .rating(rd.stars()).comment(rd.comment())
                .build());
            BigDecimal newRating = tour.getRating()
                .multiply(BigDecimal.valueOf(tour.getReviewsCount()))
                .add(BigDecimal.valueOf(rd.stars()))
                .divide(BigDecimal.valueOf(tour.getReviewsCount() + 1), 1, RoundingMode.HALF_UP);
            tour.setRating(newRating);
            tour.setReviewsCount(tour.getReviewsCount() + 1);
            tourRepository.save(tour);
        }
        log.info("DataSeeder: seeded {} reviews.", list.size());
    }

    // ─── WISHLIST ─────────────────────────────────────────────────────────────

    private void seedWishlist(User ivan, User anna, User mykola, User olena, List<Tour> tours) {
        wishlistRepository.saveAll(List.of(
            wl(ivan,   tours.get(1)),   // Іван    → Туреччина
            wl(ivan,   tours.get(6)),   // Іван    → Мальдіви
            wl(anna,   tours.get(2)),   // Анна    → ОАЕ
            wl(anna,   tours.get(5)),   // Анна    → Таїланд
            wl(mykola, tours.get(4)),   // Микола  → Іспанія
            wl(mykola, tours.get(2)),   // Микола  → ОАЕ
            wl(olena,  tours.get(3)),   // Олена   → Греція
            wl(olena,  tours.get(1))    // Олена   → Туреччина
        ));
        log.info("DataSeeder: seeded 8 wishlist items.");
    }

    private Wishlist wl(User user, Tour tour) {
        return Wishlist.builder()
            .id(new WishlistId(user.getId(), tour.getId()))
            .user(user).tour(tour)
            .build();
    }

    // ─── MANAGER NOTES ───────────────────────────────────────────────────────

    private void seedManagerNotes(User ivan, User anna, User mykola, User olena, User manager) {
        managerNoteRepository.saveAll(List.of(
            ManagerNote.builder().user(ivan).manager(manager).note(
                "Постійний клієнт, завжди вчасно оплачує бронювання. " +
                "Надає перевагу пляжному відпочинку системи «все включено». " +
                "Рекомендовано пріоритетне обслуговування та персональні пропозиції.").build(),
            ManagerNote.builder().user(anna).manager(manager).note(
                "Клієнт срібного рівня лояльності (1240 балів). " +
                "Цікавиться екзотичними маршрутами: Азія, Близький Схід, ОАЕ. " +
                "Часто подорожує з подругами. Чутлива до ціни — пропонувати акції.").build(),
            ManagerNote.builder().user(mykola).manager(manager).note(
                "Золотий рівень лояльності (5800 балів). Любить Азію — вже був у Таїланді. " +
                "Наступна ціль — Балі або В'єтнам. Завжди бере страхування та трансфер. " +
                "Потенційний кандидат для переходу на платиновий рівень.").build(),
            ManagerNote.builder().user(olena).manager(manager).note(
                "Платиновий рівень лояльності (12500 балів)! VIP клієнт агентства. " +
                "Подорожує сім'єю з 3 осіб. Вимоги: 4-5*, AI, зручний переліт. " +
                "Завжди отримує максимальну знижку. Обов'язкова особлива увага.").build()
        ));
        log.info("DataSeeder: seeded 4 manager notes.");
    }
}
