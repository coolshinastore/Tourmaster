package com.tourmaster.service;

import com.tourmaster.dto.request.CreateBookingRequest;
import com.tourmaster.dto.response.BookingDetailResponse;
import com.tourmaster.dto.response.BookingResponse;
import com.tourmaster.dto.response.ExtraServiceResponse;
import com.tourmaster.dto.response.PageResponse;
import com.tourmaster.entity.*;
import com.tourmaster.exception.BusinessException;
import com.tourmaster.exception.ResourceNotFoundException;
import com.tourmaster.mapper.BookingMapper;
import com.tourmaster.mapper.TourMapper;
import com.tourmaster.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final int CANCELLATION_DAYS_LIMIT = 3;

    private final BookingRepository bookingRepository;
    private final TourDateRepository tourDateRepository;
    private final ExtraServiceRepository extraServiceRepository;
    private final BookingMapper bookingMapper;
    private final TourMapper tourMapper;

    @Transactional
    public BookingDetailResponse create(CreateBookingRequest request, User user) {
        TourDate tourDate = tourDateRepository.findById(request.tourDateId())
                .orElseThrow(() -> new ResourceNotFoundException("TourDate", request.tourDateId()));

        if (tourDate.getAvailableSeats() < request.tourists().size()) {
            throw new BusinessException(
                    "Not enough seats. Available: " + tourDate.getAvailableSeats()
            );
        }

        if (tourDate.getDepartureDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Cannot book a past tour date");
        }

        Set<ExtraService> extraServices = resolveExtraServices(request.extraServiceIds());

        BigDecimal basePrice = tourDate.getEffectivePrice()
                .multiply(BigDecimal.valueOf(request.tourists().size()));
        BigDecimal extraTotal = extraServices.stream()
                .map(ExtraService::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .multiply(BigDecimal.valueOf(request.tourists().size()));

        Booking booking = Booking.builder()
                .user(user)
                .tourDate(tourDate)
                .status(BookingStatus.NEW)
                .totalPrice(basePrice.add(extraTotal))
                .discount(BigDecimal.ZERO)
                .extraServices(extraServices)
                .build();

        request.tourists().forEach(t -> {
            BookingItem item = BookingItem.builder()
                    .booking(booking)
                    .firstName(t.firstName())
                    .lastName(t.lastName())
                    .birthDate(t.birthDate())
                    .passportNumber(t.passportNumber())
                    .passportExpiry(t.passportExpiry())
                    .build();
            booking.getItems().add(item);
        });

        tourDate.setAvailableSeats(tourDate.getAvailableSeats() - request.tourists().size());

        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toDetailResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getMyBookings(User user, String status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var result = (status != null && !status.isBlank())
                ? bookingRepository.findByUserIdAndStatus(user.getId(), BookingStatus.valueOf(status), pageable)
                : bookingRepository.findByUserId(user.getId(), pageable);
        return PageResponse.of(result.map(bookingMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public BookingDetailResponse getById(Long id, User user) {
        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Access denied", HttpStatus.FORBIDDEN);
        }
        return bookingMapper.toDetailResponse(booking);
    }

    @Transactional
    public void cancel(Long id, User user) {
        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Access denied", HttpStatus.FORBIDDEN);
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BusinessException("Cannot cancel a completed booking");
        }

        LocalDate deadline = booking.getTourDate().getDepartureDate().minusDays(CANCELLATION_DAYS_LIMIT);
        if (LocalDate.now().isAfter(deadline)) {
            throw new BusinessException(
                    "Cancellation is only allowed up to " + CANCELLATION_DAYS_LIMIT + " days before departure"
            );
        }

        TourDate tourDate = booking.getTourDate();
        tourDate.setAvailableSeats(tourDate.getAvailableSeats() + booking.getItems().size());
        booking.setStatus(BookingStatus.CANCELLED);
    }

    @Transactional(readOnly = true)
    public List<ExtraServiceResponse> getExtraServices() {
        return extraServiceRepository.findAll().stream()
                .map(s -> new ExtraServiceResponse(
                        s.getId(), s.getName(), s.getDescription(),
                        s.getPrice(), s.getType().name()
                ))
                .toList();
    }

    private Set<ExtraService> resolveExtraServices(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) return Set.of();
        return ids.stream()
                .map(id -> extraServiceRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("ExtraService", id)))
                .collect(Collectors.toSet());
    }
}
