package com.tourmaster.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminBookingResponse(
        Long id,
        String clientFullName,
        String clientEmail,
        String clientPhone,
        Long tourId,
        String tourTitle,
        String country,
        LocalDate departureDate,
        LocalDate returnDate,
        BigDecimal totalPrice,
        String status,
        int touristsCount,
        LocalDateTime createdAt
) {}
