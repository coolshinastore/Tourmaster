package com.tourmaster.dto.response;

import com.tourmaster.entity.Role;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        Long userId,
        String email,
        String firstName,
        String lastName,
        Role role
) {}
