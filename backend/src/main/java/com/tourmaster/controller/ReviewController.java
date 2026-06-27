package com.tourmaster.controller;

import com.tourmaster.dto.request.CreateReviewRequest;
import com.tourmaster.dto.response.ReviewResponse;
import com.tourmaster.entity.User;
import com.tourmaster.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Відгуки клієнтів")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Залишити відгук для завершеного бронювання")
    public ReviewResponse create(
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal User user
    ) {
        return reviewService.createReview(user, request);
    }
}
