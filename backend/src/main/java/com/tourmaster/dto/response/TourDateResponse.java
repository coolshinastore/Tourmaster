package com.tourmaster.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TourDateResponse(
        Long id,
        LocalDate departureDate,
        LocalDate returnDate,
        String departureCity,
        int totalSeats,
        int availableSeats,
        BigDecimal price
) {}
