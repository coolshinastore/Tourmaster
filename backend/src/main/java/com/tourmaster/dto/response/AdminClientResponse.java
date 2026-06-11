package com.tourmaster.dto.response;

public record AdminClientResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        int loyaltyPoints,
        long totalBookings
) {}
