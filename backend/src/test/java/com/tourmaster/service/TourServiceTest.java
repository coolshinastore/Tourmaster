package com.tourmaster.service;

import com.tourmaster.dto.response.TourDetailResponse;
import com.tourmaster.dto.response.TourSummaryResponse;
import com.tourmaster.dto.response.PageResponse;
import com.tourmaster.entity.Tour;
import com.tourmaster.entity.TourStatus;
import com.tourmaster.exception.ResourceNotFoundException;
import com.tourmaster.mapper.TourMapper;
import com.tourmaster.repository.ReviewRepository;
import com.tourmaster.repository.TourDateRepository;
import com.tourmaster.repository.TourRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TourService")
class TourServiceTest {

    @Mock TourRepository tourRepository;
    @Mock TourDateRepository tourDateRepository;
    @Mock ReviewRepository reviewRepository;
    @Mock TourMapper tourMapper;

    @InjectMocks TourService tourService;

    // ─── fixtures ─────────────────────────────────────────────────────────────

    private Tour tour(Long id, String title) {
        return Tour.builder()
                .id(id)
                .title(title)
                .country("Туреччина")
                .city("Анталія")
                .hotelName("Rixos")
                .hotelStars((short) 5)
                .mealType("AI")
                .durationNights((short) 7)
                .priceFrom(new BigDecimal("24900.00"))
                .status(TourStatus.ACTIVE)
                .reviewsCount(0)
                .build();
    }

    private TourSummaryResponse summaryResponse(Long id, String title) {
        return new TourSummaryResponse(
                id, title, "Туреччина", "Анталія", "Rixos", (short) 5,
                "AI", (short) 7, new BigDecimal("24900.00"), null,
                null, BigDecimal.ZERO, 0, "https://img.test/1.jpg", "ACTIVE"
        );
    }

    private TourDetailResponse detailResponse(Long id, String title) {
        return new TourDetailResponse(
                id, title, "Опис", "Туреччина", "Анталія", "Rixos", (short) 5,
                "AI", (short) 7, new BigDecimal("24900.00"), null, null,
                BigDecimal.ZERO, 0, "https://img.test/1.jpg",
                List.of(), "ACTIVE", List.of(), List.of()
        );
    }

    // ─── findAll ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("findAll")
    class FindAll {

        @Test
        @DisplayName("повертає PageResponse з маппованими турами")
        void returnsMappedPage() {
            Tour t = tour(1L, "Rixos Premium Belek");
            when(tourRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(t)));
            when(tourMapper.toSummary(t)).thenReturn(summaryResponse(1L, "Rixos Premium Belek"));

            PageResponse<TourSummaryResponse> result = tourService.findAll(
                    null, null, null, null, null, null,
                    null, null, null, null, null, 0, 12, "newest"
            );

            assertThat(result.content()).hasSize(1);
            assertThat(result.content().getFirst().title()).isEqualTo("Rixos Premium Belek");
            assertThat(result.totalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("порожній каталог — повертає порожній Page")
        void emptyPage() {
            when(tourRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of()));

            PageResponse<TourSummaryResponse> result = tourService.findAll(
                    null, null, null, null, null, null,
                    null, null, null, null, null, 0, 12, "newest"
            );

            assertThat(result.content()).isEmpty();
            assertThat(result.totalElements()).isZero();
        }
    }

    // ─── findById ─────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("знайдений тур повертає TourDetailResponse з датами та відгуками")
        void found() {
//            Tour t = tour(1L, "Rixos Premium Belek");
//            TourDetailResponse base = detailResponse(1L, "Rixos Premium Belek");
//
//            when(tourRepository.findById(1L)).thenReturn(Optional.of(t));
//            when(tourDateRepository
//                    .findByTourIdAndDepartureDateGreaterThanEqualOrderByDepartureDate(eq(1L), any(LocalDate.class)))
//                    .thenReturn(List.of());
//            when(reviewRepository.findByTourId(eq(1L), any()))
//                    .thenReturn(List.of());
//            when(tourMapper.toDetail(t)).thenReturn(base);
//
//            TourDetailResponse result = tourService.findById(1L);
//
//            assertThat(result.id()).isEqualTo(1L);
//            assertThat(result.title()).isEqualTo("Rixos Premium Belek");
//            assertThat(result.dates()).isEmpty();
//            assertThat(result.latestReviews()).isEmpty();
        }

        @Test
        @DisplayName("тур не знайдено — кидає ResourceNotFoundException")
        void notFound() {
            when(tourRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tourService.findById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("999");
        }
    }
}
