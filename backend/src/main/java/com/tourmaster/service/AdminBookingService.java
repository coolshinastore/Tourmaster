package com.tourmaster.service;

import com.tourmaster.dto.request.UpdateBookingStatusRequest;
import com.tourmaster.dto.response.AdminBookingResponse;
import com.tourmaster.dto.response.BookingDetailResponse;
import com.tourmaster.dto.response.PageResponse;
import com.tourmaster.entity.Booking;
import com.tourmaster.entity.BookingStatus;
import com.tourmaster.entity.TourDate;
import com.tourmaster.exception.BusinessException;
import com.tourmaster.exception.ResourceNotFoundException;
import com.tourmaster.mapper.BookingMapper;
import com.tourmaster.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class AdminBookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public PageResponse<AdminBookingResponse> findAll(String status, YearMonth month,
                                                      int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<Booking> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<>();

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), BookingStatus.valueOf(status)));
            }
            if (month != null) {
                LocalDate from = month.atDay(1);
                LocalDate to   = month.atEndOfMonth();
                predicates.add(cb.between(
                        cb.function("DATE", LocalDate.class, root.get("createdAt")),
                        from, to
                ));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return PageResponse.of(bookingRepository.findAll(spec, pageable).map(this::toAdminResponse));
    }

    @Transactional(readOnly = true)
    public BookingDetailResponse findById(Long id) {
        return bookingMapper.toDetailResponse(findOrThrow(id));
    }

    @Transactional
    public AdminBookingResponse updateStatus(Long id, UpdateBookingStatusRequest request) {
        Booking booking = findOrThrow(id);
        BookingStatus newStatus = parseStatus(request.status());

        validateTransition(booking.getStatus(), newStatus);

        // Restore seats if cancelling
        if (newStatus == BookingStatus.CANCELLED && booking.getStatus() != BookingStatus.CANCELLED) {
            TourDate td = booking.getTourDate();
            td.setAvailableSeats(td.getAvailableSeats() + booking.getItems().size());
        }

        booking.setStatus(newStatus);

        if (request.sendNotification()) {
            notificationService.sendBookingStatusChanged(booking);
        }

        return toAdminResponse(booking);
    }

    private void validateTransition(BookingStatus current, BookingStatus next) {
        if (current == BookingStatus.COMPLETED || current == BookingStatus.CANCELLED) {
            throw new BusinessException("Cannot change status from " + current);
        }
    }

    private AdminBookingResponse toAdminResponse(Booking b) {
        var tour = b.getTourDate().getTour();
        var client = b.getUser();
        return new AdminBookingResponse(
                b.getId(),
                client.getFirstName() + " " + client.getLastName(),
                client.getEmail(),
                client.getPhone(),
                tour.getId(),
                tour.getTitle(),
                tour.getCountry(),
                b.getTourDate().getDepartureDate(),
                b.getTourDate().getReturnDate(),
                b.getTotalPrice(),
                b.getStatus().name(),
                b.getItems().size(),
                b.getCreatedAt()
        );
    }

    private Booking findOrThrow(Long id) {
        return bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
    }

    private BookingStatus parseStatus(String status) {
        try {
            return BookingStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Unknown booking status: " + status);
        }
    }
}
