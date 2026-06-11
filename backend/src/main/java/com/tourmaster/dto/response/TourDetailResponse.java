package com.tourmaster.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record TourDetailResponse(
        Long id,
        String title,
        String description,
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
        List<String> galleryUrls,
        String status,
        List<TourDateResponse> dates,
        List<ReviewResponse> latestReviews
) {}
