package com.tourmaster.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tours")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String country;

    private String city;

    @Column(name = "hotel_name")
    private String hotelName;

    @Column(name = "hotel_stars")
    private Short hotelStars;

    @Column(name = "meal_type")
    private String mealType;

    @Column(name = "duration_nights", nullable = false)
    private Short durationNights;

    @Column(name = "price_from", nullable = false)
    private BigDecimal priceFrom;

    @Column(name = "old_price")
    private BigDecimal oldPrice;

    private String badge;

    private BigDecimal rating;

    @Column(name = "reviews_count")
    private int reviewsCount;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "gallery_urls", columnDefinition = "TEXT[]")
    private String[] galleryUrls;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TourStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (status == null) status = TourStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
