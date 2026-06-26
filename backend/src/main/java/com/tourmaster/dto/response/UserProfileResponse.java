package com.tourmaster.dto.response;

public record UserProfileResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        int loyaltyPoints,
        String role
) {}
