package com.tourmaster.dto.response;

import java.time.LocalDate;

public record BookingItemResponse(
        Long id,
        String firstName,
        String lastName,
        LocalDate birthDate,
        String passportNumber,
        LocalDate passportExpiry
) {}
