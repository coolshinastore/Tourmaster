package com.tourmaster.dto.request;

import jakarta.validation.constraints.*;

public record CreateReviewRequest(
        @NotNull
        Long bookingId,

        @NotNull @Min(1) @Max(5)
        Short rating,

        @Size(max = 1000)
        String comment
) {}
