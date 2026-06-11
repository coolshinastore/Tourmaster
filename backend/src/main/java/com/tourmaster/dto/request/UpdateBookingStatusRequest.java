package com.tourmaster.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateBookingStatusRequest(
        @NotBlank
        String status,

        boolean sendNotification
) {}
