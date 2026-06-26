package com.tourmaster.controller;

import com.tourmaster.dto.response.DestinationStatsResponse;
import com.tourmaster.dto.response.PageResponse;
import com.tourmaster.dto.response.ReviewResponse;
import com.tourmaster.dto.response.TourDetailResponse;
import com.tourmaster.dto.response.TourSummaryResponse;
import com.tourmaster.service.TourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
@Tag(name = "Tours", description = "Каталог та пошук турів")
public class TourController {

    private final TourService tourService;

    @GetMapping
    @Operation(summary = "Каталог турів з фільтрами та пагінацією")
    public PageResponse<TourSummaryResponse> getCatalog(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) BigDecimal priceMin,
            @RequestParam(required = false) BigDecimal priceMax,
            @RequestParam(required = false) List<Short> stars,
            @RequestParam(required = false) List<String> mealType,
            @RequestParam(required = false) Integer durationMin,
            @RequestParam(required = false) Integer durationMax,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureDateTo,
            @RequestParam(required = false) String badge,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        return tourService.findAll(
                q, country, priceMin, priceMax, stars, mealType,
                durationMin, durationMax, departureDateFrom, departureDateTo,
                badge, page, size, sort
        );
    }

    @GetMapping("/search")
    @Operation(summary = "Пошук турів за ключовим словом")
    public PageResponse<TourSummaryResponse> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return tourService.findAll(
                q, null, null, null, null, null,
                null, null, null, null, null,
                page, size, "newest"
        );
    }

    @GetMapping("/destinations")
    @Operation(summary = "Статистика по популярних напрямках")
    public List<DestinationStatsResponse> getDestinations() {
        return tourService.getDestinationStats();
    }

    @GetMapping("/latest-reviews")
    @Operation(summary = "Останні відгуки клієнтів")
    public List<ReviewResponse> getLatestReviews(
            @RequestParam(defaultValue = "3") int size
    ) {
        return tourService.getLatestReviews(size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Деталі туру")
    public TourDetailResponse getById(@PathVariable Long id) {
        return tourService.findById(id);
    }
}
