package com.tourmaster.controller;

import com.tourmaster.dto.request.CreateTourDateRequest;
import com.tourmaster.dto.request.CreateTourRequest;
import com.tourmaster.dto.request.UpdateTourRequest;
import com.tourmaster.dto.response.AdminTourResponse;
import com.tourmaster.dto.response.PageResponse;
import com.tourmaster.dto.response.TourDetailResponse;
import com.tourmaster.service.AdminTourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tours")
@RequiredArgsConstructor
@Tag(name = "Admin — Tours", description = "Управління каталогом турів")
public class AdminTourController {

    private final AdminTourService adminTourService;

    @GetMapping
    @Operation(summary = "Список всіх турів (адмін)")
    public PageResponse<AdminTourResponse> getAll(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return adminTourService.findAll(q, country, status, page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Створити новий тур")
    public TourDetailResponse create(@Valid @RequestBody CreateTourRequest request) {
        return adminTourService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Оновити тур")
    public TourDetailResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTourRequest request
    ) {
        return adminTourService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Архівувати тур (не видаляти, якщо є активні бронювання)")
    public void archive(@PathVariable Long id) {
        adminTourService.archive(id);
    }

    @PostMapping("/{id}/dates")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Додати дату вильоту до туру")
    public TourDetailResponse addDate(
            @PathVariable Long id,
            @Valid @RequestBody CreateTourDateRequest request
    ) {
        return adminTourService.addDate(id, request);
    }
}
