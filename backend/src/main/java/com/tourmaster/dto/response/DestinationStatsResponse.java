package com.tourmaster.dto.response;

import java.math.BigDecimal;

public record DestinationStatsResponse(
        String country,
        long toursCount,
        BigDecimal priceFrom
) {}
