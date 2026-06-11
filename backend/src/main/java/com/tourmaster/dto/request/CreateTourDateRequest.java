package com.tourmaster.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTourDateRequest(
        @NotNull @Future
        LocalDate departureDate,

        @NotNull
        LocalDate returnDate,

        String departureCity,

        @NotNull @Min(1)
        Integer totalSeats,

        BigDecimal priceOverride
) {}
