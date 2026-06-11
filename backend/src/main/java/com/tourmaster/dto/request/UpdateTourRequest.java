package com.tourmaster.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record UpdateTourRequest(
        @Size(max = 255)
        String title,

        String description,

        @Size(max = 100)
        String country,

        @Size(max = 100)
        String city,

        @Size(max = 255)
        String hotelName,

        @Min(1) @Max(5)
        Short hotelStars,

        @Size(max = 50)
        String mealType,

        @Min(1)
        Short durationNights,

        @DecimalMin("0.01")
        BigDecimal priceFrom,

        BigDecimal oldPrice,

        @Size(max = 50)
        String badge,

        @Size(max = 512)
        String imageUrl,

        List<String> galleryUrls
) {}
