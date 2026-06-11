package com.tourmaster.controller;

import com.tourmaster.dto.request.CreateBookingRequest;
import com.tourmaster.dto.response.BookingDetailResponse;
import com.tourmaster.dto.response.BookingResponse;
import com.tourmaster.dto.response.ExtraServiceResponse;
import com.tourmaster.dto.response.PageResponse;
import com.tourmaster.entity.User;
import com.tourmaster.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Бронювання турів")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Створити бронювання")
    public BookingDetailResponse create(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal User user
    ) {
        return bookingService.create(request, user);
    }

    @GetMapping("/my")
    @Operation(summary = "Мої бронювання")
    public PageResponse<BookingResponse> getMyBookings(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user
    ) {
        return bookingService.getMyBookings(user, status, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Деталі бронювання")
    public BookingDetailResponse getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return bookingService.getById(id, user);
    }

    @PostMapping("/{id}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Скасувати бронювання (не пізніше ніж за 3 доби до вильоту)")
    public void cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        bookingService.cancel(id, user);
    }

    @GetMapping("/extra-services")
    @Operation(summary = "Список доступних додаткових послуг")
    public List<ExtraServiceResponse> getExtraServices() {
        return bookingService.getExtraServices();
    }
}
