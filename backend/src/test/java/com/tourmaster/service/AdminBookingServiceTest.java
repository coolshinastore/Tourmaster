package com.tourmaster.service;

import com.tourmaster.dto.request.UpdateBookingStatusRequest;
import com.tourmaster.dto.response.AdminBookingResponse;
import com.tourmaster.entity.*;
import com.tourmaster.exception.BusinessException;
import com.tourmaster.exception.ResourceNotFoundException;
import com.tourmaster.mapper.BookingMapper;
import com.tourmaster.repository.BookingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminBookingService")
class AdminBookingServiceTest {

    @Mock BookingRepository bookingRepository;
    @Mock BookingMapper bookingMapper;
    @Mock NotificationService notificationService;

    @InjectMocks AdminBookingService adminBookingService;

    // ─── fixtures ─────────────────────────────────────────────────────────────

    private Booking booking(Long id, BookingStatus status) {
        Tour tour = Tour.builder()
                .id(10L).title("Rixos").country("Туреччина")
                .priceFrom(BigDecimal.valueOf(24900))
                .status(TourStatus.ACTIVE).reviewsCount(0).build();

        TourDate tourDate = TourDate.builder()
                .id(100L).tour(tour)
                .departureDate(LocalDate.now().plusDays(30))
                .returnDate(LocalDate.now().plusDays(37))
                .totalSeats(20).availableSeats(10).build();

        User user = User.builder()
                .id(1L).email("c@test.com").firstName("Іван").lastName("П.")
                .role(Role.CLIENT).loyaltyPoints(0).build();

        BookingItem item = BookingItem.builder()
                .firstName("Іван").lastName("П.")
                .birthDate(LocalDate.of(1990, 1, 1))
                .passportNumber("AA111111")
                .passportExpiry(LocalDate.of(2030, 1, 1))
                .build();

        return Booking.builder()
                .id(id)
                .user(user)
                .tourDate(tourDate)
                .status(status)
                .totalPrice(BigDecimal.valueOf(48800))
                .discount(BigDecimal.ZERO)
                .items(new ArrayList<>(List.of(item)))
                .extraServices(new HashSet<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ─── updateStatus ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateStatus")
    class UpdateStatus {

        @Test
        @DisplayName("NEW → CONFIRMED без нотифікації")
        void newToConfirmed() {
            Booking b = booking(1L, BookingStatus.NEW);
            when(bookingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(b));

            adminBookingService.updateStatus(1L, new UpdateBookingStatusRequest("CONFIRMED", false));

            assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
            verify(notificationService, never()).sendBookingStatusChanged(any());
        }

        @Test
        @DisplayName("CONFIRMED → PAID з email-нотифікацією")
        void confirmedToPaidWithNotification() {
            Booking b = booking(1L, BookingStatus.CONFIRMED);
            when(bookingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(b));

            adminBookingService.updateStatus(1L, new UpdateBookingStatusRequest("PAID", true));

            assertThat(b.getStatus()).isEqualTo(BookingStatus.PAID);
            verify(notificationService).sendBookingStatusChanged(b);
        }

        @Test
        @DisplayName("скасування відновлює місця на рейсі")
        void cancellationRestoresSeats() {
            Booking b = booking(1L, BookingStatus.CONFIRMED);
            int seatsBefore = b.getTourDate().getAvailableSeats();

            when(bookingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(b));

            adminBookingService.updateStatus(1L, new UpdateBookingStatusRequest("CANCELLED", false));

            assertThat(b.getStatus()).isEqualTo(BookingStatus.CANCELLED);
            assertThat(b.getTourDate().getAvailableSeats()).isEqualTo(seatsBefore + 1);
        }

        @Test
        @DisplayName("зміна статусу завершеного бронювання — кидає BusinessException")
        void cannotChangeCompleted() {
            Booking b = booking(1L, BookingStatus.COMPLETED);
            when(bookingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(b));

            assertThatThrownBy(() ->
                    adminBookingService.updateStatus(1L, new UpdateBookingStatusRequest("CANCELLED", false)))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("COMPLETED");
        }

        @Test
        @DisplayName("зміна статусу скасованого бронювання — кидає BusinessException")
        void cannotChangeCancelled() {
            Booking b = booking(1L, BookingStatus.CANCELLED);
            when(bookingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(b));

            assertThatThrownBy(() ->
                    adminBookingService.updateStatus(1L, new UpdateBookingStatusRequest("NEW", false)))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("CANCELLED");
        }

        @Test
        @DisplayName("невідомий статус — кидає BusinessException")
        void unknownStatus() {
            Booking b = booking(1L, BookingStatus.NEW);
            when(bookingRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(b));

            assertThatThrownBy(() ->
                    adminBookingService.updateStatus(1L, new UpdateBookingStatusRequest("INVALID", false)))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("INVALID");
        }

        @Test
        @DisplayName("бронювання не знайдено — кидає ResourceNotFoundException")
        void notFound() {
            when(bookingRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    adminBookingService.updateStatus(999L, new UpdateBookingStatusRequest("PAID", false)))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
