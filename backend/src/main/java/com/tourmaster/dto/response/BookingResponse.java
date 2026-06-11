package com.tourmaster.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        Long tourId,
        String tourTitle,
        String country,
        String imageUrl,
        Short durationNights,
        LocalDate departureDate,
        LocalDate returnDate,
        String departureCity,
        String status,
        BigDecimal totalPrice,
        BigDecimal discount,
        int touristsCount,
        LocalDateTime createdAt
) {}
