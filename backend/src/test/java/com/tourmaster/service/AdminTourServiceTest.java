package com.tourmaster.service;

import com.tourmaster.dto.request.CreateTourRequest;
import com.tourmaster.dto.request.UpdateTourRequest;
import com.tourmaster.dto.response.TourDetailResponse;
import com.tourmaster.entity.*;
import com.tourmaster.exception.BusinessException;
import com.tourmaster.exception.ResourceNotFoundException;
import com.tourmaster.mapper.TourMapper;
import com.tourmaster.repository.BookingRepository;
import com.tourmaster.repository.TourDateRepository;
import com.tourmaster.repository.TourRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminTourService")
class AdminTourServiceTest {

    @Mock TourRepository tourRepository;
    @Mock TourDateRepository tourDateRepository;
    @Mock BookingRepository bookingRepository;
    @Mock TourMapper tourMapper;

    @InjectMocks AdminTourService adminTourService;

    // ─── fixtures ─────────────────────────────────────────────────────────────

    private Tour activeTour(Long id) {
        return Tour.builder()
                .id(id)
                .title("Тур")
                .country("Туреччина")
                .hotelStars((short) 5)
                .durationNights((short) 7)
                .priceFrom(new BigDecimal("24900.00"))
                .status(TourStatus.ACTIVE)
                .reviewsCount(0)
                .build();
    }

    private TourDetailResponse detailResponse(Long id) {
        return new TourDetailResponse(
                id, "Тур", "Опис", "Туреччина", null, null, (short) 5,
                "AI", (short) 7, new BigDecimal("24900.00"), null, null,
                BigDecimal.ZERO, 0, null, List.of(), "ACTIVE", List.of(), List.of()
        );
    }

    // ─── archive ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("archive")
    class Archive {

        @Test
        @DisplayName("успішне архівування — немає активних бронювань")
        void success() {
            Tour t = activeTour(1L);
            when(tourRepository.findById(1L)).thenReturn(Optional.of(t));
            when(bookingRepository.existsByTourDateIdAndStatusIn(eq(1L), any()))
                    .thenReturn(false);

            adminTourService.archive(1L);

            assertThat(t.getStatus()).isEqualTo(TourStatus.ARCHIVED);
        }

        @Test
        @DisplayName("архівування з активними бронюваннями — кидає BusinessException з CONFLICT")
        void hasActiveBookings() {
            Tour t = activeTour(1L);
            when(tourRepository.findById(1L)).thenReturn(Optional.of(t));
            when(bookingRepository.existsByTourDateIdAndStatusIn(eq(1L), any()))
                    .thenReturn(true);

            assertThatThrownBy(() -> adminTourService.archive(1L))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> assertThat(((BusinessException) ex).getStatus())
                            .isEqualTo(HttpStatus.CONFLICT));

            assertThat(t.getStatus()).isEqualTo(TourStatus.ACTIVE);
        }

        @Test
        @DisplayName("тур не знайдено — кидає ResourceNotFoundException")
        void tourNotFound() {
            when(tourRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> adminTourService.archive(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── create ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("зберігає тур зі статусом ACTIVE та повертає деталі")
        void success() {
            CreateTourRequest req = new CreateTourRequest(
                    "Тур", "Опис", "Туреччина", "Анталія", "Rixos",
                    (short) 5, "AI", (short) 7,
                    new BigDecimal("24900.00"), null, null,
                    "https://img.test/1.jpg", List.of()
            );
            Tour saved = activeTour(1L);

            when(tourRepository.save(any(Tour.class))).thenReturn(saved);
            when(tourDateRepository
                    .findByTourIdAndDepartureDateGreaterThanEqualOrderByDepartureDate(eq(1L), any(LocalDate.class)))
                    .thenReturn(List.of());
            when(tourMapper.toDetail(saved)).thenReturn(detailResponse(1L));

            TourDetailResponse resp = adminTourService.create(req);

            assertThat(resp.id()).isEqualTo(1L);
            verify(tourRepository).save(argThat(t -> t.getStatus() == TourStatus.ACTIVE));
        }
    }

    // ─── update ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        @DisplayName("оновлює тільки передані поля")
        void partialUpdate() {
            Tour t = activeTour(1L);
            t.setTitle("Стара назва");

            UpdateTourRequest req = new UpdateTourRequest(
                    "Нова назва", null, null, null, null, null, null,
                    null, null, null, null, null, null
            );

            when(tourRepository.findById(1L)).thenReturn(Optional.of(t));
            when(tourDateRepository
                    .findByTourIdAndDepartureDateGreaterThanEqualOrderByDepartureDate(eq(1L), any(LocalDate.class)))
                    .thenReturn(List.of());
            when(tourMapper.toDetail(t)).thenReturn(detailResponse(1L));

            adminTourService.update(1L, req);

            assertThat(t.getTitle()).isEqualTo("Нова назва");
            assertThat(t.getCountry()).isEqualTo("Туреччина"); // незмінно
        }
    }
}
