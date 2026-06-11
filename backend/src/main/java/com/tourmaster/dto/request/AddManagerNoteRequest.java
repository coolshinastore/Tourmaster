package com.tourmaster.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddManagerNoteRequest(
        @NotBlank @Size(max = 2000)
        String note
) {}
