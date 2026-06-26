package com.tourmaster.service;

import com.tourmaster.dto.request.BookingItemRequest;
import com.tourmaster.dto.request.CreateBookingRequest;
import com.tourmaster.dto.response.BookingDetailResponse;
import com.tourmaster.entity.*;
import com.tourmaster.exception.BusinessException;
import com.tourmaster.exception.ResourceNotFoundException;
import com.tourmaster.mapper.BookingMapper;
import com.tourmaster.mapper.TourMapper;
import com.tourmaster.repository.BookingRepository;
import com.tourmaster.repository.ExtraServiceRepository;
import com.tourmaster.repository.TourDateRepository;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService")
class BookingServiceTest {

    @Mock BookingRepository bookingRepository;
    @Mock TourDateRepository tourDateRepository;
    @Mock ExtraServiceRepository extraServiceRepository;
    @Mock BookingMapper bookingMapper;
    @Mock TourMapper tourMapper;

    @InjectMocks BookingService bookingService;

    // ─── test fixtures ────────────────────────────────────────────────────────

    private User user(Long id) {
        return User.builder()
                .id(id)
                .email("client@test.com")
                .role(Role.CLIENT)
                .loyaltyPoints(0)
                .build();
    }

    private Tour tour() {
        return Tour.builder()
                .id(10L)
                .title("Туреччина")
                .priceFrom(new BigDecimal("24900.00"))
                .status(TourStatus.ACTIVE)
                .build();
    }

    private TourDate tourDate(int seats, LocalDate departure) {
        return TourDate.builder()
                .id(100L)
                .tour(tour())
                .departureDate(departure)
                .returnDate(departure.plusDays(7))
                .departureCity("Київ")
                .totalSeats(seats)
                .availableSeats(seats)
                .build();
    }

    private CreateBookingRequest singleTouristRequest(Long tourDateId) {
        var tourist = new BookingItemRequest(
                "Іван", "Петренко",
                LocalDate.of(2000, 1, 1),
                "AA123456",
                LocalDate.of(2030, 1, 1)
        );
        return new CreateBookingRequest(tourDateId, List.of(tourist), Set.of());
    }

    // ─── create ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("успішне бронювання зменшує доступні місця та повертає деталі")
        void success() {
            User client = user(1L);
            TourDate td = tourDate(10, LocalDate.now().plusDays(30));
            CreateBookingRequest req = singleTouristRequest(td.getId());

            when(tourDateRepository.findById(td.getId())).thenReturn(Optional.of(td));
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
            when(bookingMapper.toDetailResponse(any())).thenReturn(mock(BookingDetailResponse.class));

            bookingService.create(req, client);

            assertThat(td.getAvailableSeats()).isEqualTo(9);
            verify(bookingRepository).save(any(Booking.class));
        }

        @Test
        @DisplayName("недостатньо місць — кидає BusinessException")
        void notEnoughSeats() {
            User client = user(1L);
            TourDate td = tourDate(0, LocalDate.now().plusDays(30));
            CreateBookingRequest req = singleTouristRequest(td.getId());

            when(tourDateRepository.findById(td.getId())).thenReturn(Optional.of(td));

            assertThatThrownBy(() -> bookingService.create(req, client))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("seats");

            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("минула дата вильоту — кидає BusinessException")
        void pastDeparture() {
            User client = user(1L);
            TourDate td = tourDate(10, LocalDate.now().minusDays(1));
            CreateBookingRequest req = singleTouristRequest(td.getId());

            when(tourDateRepository.findById(td.getId())).thenReturn(Optional.of(td));

            assertThatThrownBy(() -> bookingService.create(req, client))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("past");

            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("tourDate не існує — кидає ResourceNotFoundException")
        void tourDateNotFound() {
            when(tourDateRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.create(singleTouristRequest(999L), user(1L)))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ─── cancel ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("cancel")
    class Cancel {

        private Booking booking(Long bookingId, Long userId, BookingStatus status, LocalDate departure) {
            User owner = user(userId);
            TourDate td = tourDate(10, departure);

            BookingItem item = BookingItem.builder()
                    .firstName("Іван").lastName("П.").build();
            List<BookingItem> items = new ArrayList<>(List.of(item));

            return Booking.builder()
                    .id(bookingId)
                    .user(owner)
                    .tourDate(td)
                    .status(status)
                    .totalPrice(new BigDecimal("24900.00"))
                    .discount(BigDecimal.ZERO)
                    .items(items)
                    .extraServices(Set.of())
                    .build();
        }

        @Test
        @DisplayName("успішне скасування змінює статус та відновлює місця")
        void success() {
            Booking b = booking(1L, 1L, BookingStatus.CONFIRMED, LocalDate.now().plusDays(10));
            when(bookingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(b));

            bookingService.cancel(1L, user(1L));

            assertThat(b.getStatus()).isEqualTo(BookingStatus.CANCELLED);
            assertThat(b.getTourDate().getAvailableSeats()).isEqualTo(11);
        }

        @Test
        @DisplayName("скасування вже скасованого — кидає BusinessException")
        void alreadyCancelled() {
            Booking b = booking(1L, 1L, BookingStatus.CANCELLED, LocalDate.now().plusDays(10));
            when(bookingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(b));

            assertThatThrownBy(() -> bookingService.cancel(1L, user(1L)))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("already cancelled");
        }

        @Test
        @DisplayName("скасування завершеного — кидає BusinessException")
        void completedBooking() {
            Booking b = booking(1L, 1L, BookingStatus.COMPLETED, LocalDate.now().minusDays(1));
            when(bookingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(b));

            assertThatThrownBy(() -> bookingService.cancel(1L, user(1L)))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("completed");
        }

        @Test
        @DisplayName("скасування після дедлайну — кидає BusinessException")
        void pastDeadline() {
            // departure is 2 days away — deadline was yesterday (3 days before)
            Booking b = booking(1L, 1L, BookingStatus.CONFIRMED, LocalDate.now().plusDays(2));
            when(bookingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(b));

            assertThatThrownBy(() -> bookingService.cancel(1L, user(1L)))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("days before departure");
        }

        @Test
        @DisplayName("чужа броня — кидає BusinessException з FORBIDDEN")
        void accessDenied() {
            Booking b = booking(1L, 99L, BookingStatus.CONFIRMED, LocalDate.now().plusDays(10));
            when(bookingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(b));

            assertThatThrownBy(() -> bookingService.cancel(1L, user(1L)))
                    .isInstanceOf(BusinessException.class)
                    .extracting("status").isEqualTo(HttpStatus.FORBIDDEN);
        }

        @Test
        @DisplayName("броня не знайдена — кидає ResourceNotFoundException")
        void notFound() {
            when(bookingRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.cancel(999L, user(1L)))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
