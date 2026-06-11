package com.tourmaster.dto.response;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        String authorFirstName,
        String authorLastLetter,
        Short rating,
        String comment,
        LocalDateTime createdAt
) {}
