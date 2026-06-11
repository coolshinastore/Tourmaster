package com.tourmaster.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record AdminClientProfileResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        int loyaltyPoints,
        long totalBookings,
        BigDecimal totalSpent,
        List<BookingResponse> recentBookings,
        List<ManagerNoteResponse> notes
) {}
