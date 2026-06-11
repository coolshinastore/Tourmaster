package com.tourmaster.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminTourResponse(
        Long id,
        String title,
        String country,
        String hotelName,
        Short hotelStars,
        String mealType,
        Short durationNights,
        BigDecimal priceFrom,
        String badge,
        String imageUrl,
        String status,
        int activeDatesCount,
        LocalDateTime createdAt
) {}
