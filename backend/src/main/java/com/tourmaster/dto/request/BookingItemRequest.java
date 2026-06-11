package com.tourmaster.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record BookingItemRequest(
        @NotBlank @Size(max = 100)
        String firstName,

        @NotBlank @Size(max = 100)
        String lastName,

        @NotNull @Past
        LocalDate birthDate,

        @NotBlank @Size(max = 50)
        String passportNumber,

        @NotNull
        LocalDate passportExpiry
) {}
