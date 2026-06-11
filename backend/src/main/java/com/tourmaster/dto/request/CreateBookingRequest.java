package com.tourmaster.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Set;

public record CreateBookingRequest(
        @NotNull
        Long tourDateId,

        @NotEmpty @Valid
        List<BookingItemRequest> tourists,

        Set<Long> extraServiceIds
) {}
