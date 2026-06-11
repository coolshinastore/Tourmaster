package com.tourmaster.controller;

import com.tourmaster.dto.request.UpdateBookingStatusRequest;
import com.tourmaster.dto.response.AdminBookingResponse;
import com.tourmaster.dto.response.BookingDetailResponse;
import com.tourmaster.dto.response.PageResponse;
import com.tourmaster.service.AdminBookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@Tag(name = "Admin — Bookings", description = "Управління бронюваннями")
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    @GetMapping
    @Operation(summary = "Всі бронювання з фільтрами")
    public PageResponse<AdminBookingResponse> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth month,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return adminBookingService.findAll(status, month, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Деталі бронювання (адмін)")
    public BookingDetailResponse getById(@PathVariable Long id) {
        return adminBookingService.findById(id);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Змінити статус бронювання та надіслати сповіщення")
    public AdminBookingResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookingStatusRequest request
    ) {
        return adminBookingService.updateStatus(id, request);
    }
}
