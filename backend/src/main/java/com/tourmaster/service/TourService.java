package com.tourmaster.service;

import com.tourmaster.dto.response.DestinationStatsResponse;
import com.tourmaster.dto.response.PageResponse;
import com.tourmaster.dto.response.ReviewResponse;
import com.tourmaster.dto.response.TourDateResponse;
import com.tourmaster.dto.response.TourDetailResponse;
import com.tourmaster.dto.response.TourSummaryResponse;
import com.tourmaster.entity.Tour;
import com.tourmaster.exception.ResourceNotFoundException;
import com.tourmaster.mapper.TourMapper;
import com.tourmaster.repository.ReviewRepository;
import com.tourmaster.repository.TourDateRepository;
import com.tourmaster.repository.TourRepository;
import com.tourmaster.repository.TourSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TourService {

    private final TourRepository tourRepository;
    private final TourDateRepository tourDateRepository;
    private final ReviewRepository reviewRepository;
    private final TourMapper tourMapper;

    public PageResponse<TourSummaryResponse> findAll(
            String q,
            String country,
            BigDecimal priceMin,
            BigDecimal priceMax,
            List<Short> stars,
            List<String> mealTypes,
            Integer durationMin,
            Integer durationMax,
            LocalDate departureDateFrom,
            LocalDate departureDateTo,
            String badge,
            int page,
            int size,
            String sort
    ) {
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        Specification<Tour> spec = TourSpecification.filter(
                q, country, priceMin, priceMax, stars, mealTypes,
                durationMin, durationMax, departureDateFrom, departureDateTo, badge
        );
        Page<TourSummaryResponse> result = tourRepository.findAll(spec, pageable)
                .map(tourMapper::toSummary);
        return PageResponse.of(result);
    }

    public TourDetailResponse findById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", id));

        List<TourDateResponse> dates = tourDateRepository
                .findByTourIdAndDepartureDateGreaterThanEqualOrderByDepartureDate(id, LocalDate.now())
                .stream()
                .map(tourMapper::toDateResponse)
                .toList();

        List<ReviewResponse> reviews = reviewRepository
                .findByTourId(id, PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .stream()
                .map(tourMapper::toReviewResponse)
                .toList();

        TourDetailResponse base = tourMapper.toDetail(tour);
        return new TourDetailResponse(
                base.id(), base.title(), base.description(), base.country(), base.city(),
                base.hotelName(), base.hotelStars(), base.mealType(), base.durationNights(),
                base.priceFrom(), base.oldPrice(), base.badge(), base.rating(), base.reviewsCount(),
                base.imageUrl(), base.galleryUrls(), base.status(),
                dates, reviews
        );
    }

    public List<DestinationStatsResponse> getDestinationStats() {
        return tourRepository.findDestinationStats();
    }

    public List<ReviewResponse> getLatestReviews(int size) {
        return reviewRepository
                .findAll(PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent()
                .stream()
                .map(tourMapper::toReviewResponse)
                .toList();
    }

    private Sort resolveSort(String sort) {
        return switch (sort == null ? "" : sort) {
            case "price_asc"  -> Sort.by("priceFrom").ascending();
            case "price_desc" -> Sort.by("priceFrom").descending();
            case "rating"     -> Sort.by("rating").descending();
            case "newest"     -> Sort.by("createdAt").descending();
            default           -> Sort.by("createdAt").descending();
        };
    }
}
