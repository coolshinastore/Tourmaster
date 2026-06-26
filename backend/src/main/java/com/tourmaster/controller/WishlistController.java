package com.tourmaster.controller;

import com.tourmaster.dto.response.TourSummaryResponse;
import com.tourmaster.entity.Tour;
import com.tourmaster.entity.User;
import com.tourmaster.entity.Wishlist;
import com.tourmaster.entity.WishlistId;
import com.tourmaster.exception.ResourceNotFoundException;
import com.tourmaster.repository.TourRepository;
import com.tourmaster.repository.WishlistRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Список бажань клієнта")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final TourRepository tourRepository;

    @GetMapping
    @Operation(summary = "Отримати список бажань")
    public List<TourSummaryResponse> getWishlist(@AuthenticationPrincipal User user) {
        return wishlistRepository.findByIdUserId(user.getId()).stream()
                .map(w -> toSummary(w.getTour()))
                .toList();
    }

    @PostMapping("/{tourId}")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Додати тур до списку бажань")
    public void add(@PathVariable Long tourId, @AuthenticationPrincipal User user) {
        WishlistId id = new WishlistId(user.getId(), tourId);
        if (!wishlistRepository.existsById(id)) {
            Tour tour = tourRepository.findById(tourId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tour", tourId));
            wishlistRepository.save(Wishlist.builder()
                    .id(id).user(user).tour(tour).build());
        }
    }

    @DeleteMapping("/{tourId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Видалити тур зі списку бажань")
    public void remove(@PathVariable Long tourId, @AuthenticationPrincipal User user) {
        wishlistRepository.deleteById(new WishlistId(user.getId(), tourId));
    }

    private TourSummaryResponse toSummary(Tour t) {
        return new TourSummaryResponse(
                t.getId(), t.getTitle(), t.getCountry(), t.getCity(),
                t.getHotelName(), t.getHotelStars(), t.getMealType(), t.getDurationNights(),
                t.getPriceFrom(), t.getOldPrice(), t.getBadge(),
                t.getRating(), t.getReviewsCount(), t.getImageUrl(), t.getStatus().name()
        );
    }
}
