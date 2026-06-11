package com.tourmaster.controller;

import com.tourmaster.dto.request.AddManagerNoteRequest;
import com.tourmaster.dto.response.AdminClientProfileResponse;
import com.tourmaster.dto.response.AdminClientResponse;
import com.tourmaster.dto.response.ManagerNoteResponse;
import com.tourmaster.dto.response.PageResponse;
import com.tourmaster.entity.User;
import com.tourmaster.service.AdminClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/clients")
@RequiredArgsConstructor
@Tag(name = "Admin — Clients", description = "База клієнтів")
public class AdminClientController {

    private final AdminClientService adminClientService;

    @GetMapping
    @Operation(summary = "Список клієнтів з пошуком")
    public PageResponse<AdminClientResponse> getAll(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return adminClientService.findAll(q, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Профіль клієнта з бронюваннями та нотатками")
    public AdminClientProfileResponse getProfile(@PathVariable Long id) {
        return adminClientService.getProfile(id);
    }

    @PostMapping("/{id}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Додати нотатку менеджера до клієнта")
    public ManagerNoteResponse addNote(
            @PathVariable Long id,
            @Valid @RequestBody AddManagerNoteRequest request,
            @AuthenticationPrincipal User manager
    ) {
        return adminClientService.addNote(id, manager, request);
    }
}
