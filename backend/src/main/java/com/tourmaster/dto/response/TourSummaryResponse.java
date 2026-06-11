package com.tourmaster.dto.response;

import java.math.BigDecimal;

public record TourSummaryResponse(
        Long id,
        String title,
        String country,
        String city,
        String hotelName,
        Short hotelStars,
        String mealType,
        Short durationNights,
        BigDecimal priceFrom,
        BigDecimal oldPrice,
        String badge,
        BigDecimal rating,
        int reviewsCount,
        String imageUrl,
        String status
) {}
