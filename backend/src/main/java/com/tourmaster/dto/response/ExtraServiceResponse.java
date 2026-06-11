package com.tourmaster.dto.response;

import java.math.BigDecimal;

public record ExtraServiceResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String type
) {}
