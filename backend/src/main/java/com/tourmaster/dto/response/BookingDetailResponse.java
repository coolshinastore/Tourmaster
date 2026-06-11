package com.tourmaster.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record BookingDetailResponse(
        Long id,
        Long tourId,
        String tourTitle,
        String country,
        String imageUrl,
        Short hotelStars,
        String mealType,
        Short durationNights,
        LocalDate departureDate,
        LocalDate returnDate,
        String departureCity,
        String status,
        BigDecimal totalPrice,
        BigDecimal discount,
        List<BookingItemResponse> tourists,
        List<ExtraServiceResponse> extraServices,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
