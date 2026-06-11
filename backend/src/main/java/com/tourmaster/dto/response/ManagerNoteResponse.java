package com.tourmaster.dto.response;

import java.time.LocalDateTime;

public record ManagerNoteResponse(
        Long id,
        String managerName,
        String note,
        LocalDateTime createdAt
) {}
