package com.tourmaster.service;

import com.tourmaster.dto.request.CreateTourDateRequest;
import com.tourmaster.dto.request.CreateTourRequest;
import com.tourmaster.dto.request.UpdateTourRequest;
import com.tourmaster.dto.response.AdminTourResponse;
import com.tourmaster.dto.response.PageResponse;
import com.tourmaster.dto.response.TourDetailResponse;
import com.tourmaster.entity.*;
import com.tourmaster.exception.BusinessException;
import com.tourmaster.exception.ResourceNotFoundException;
import com.tourmaster.mapper.TourMapper;
import com.tourmaster.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminTourService {

    private final TourRepository tourRepository;
    private final TourDateRepository tourDateRepository;
    private final BookingRepository bookingRepository;
    private final TourMapper tourMapper;

    @Transactional(readOnly = true)
    public PageResponse<AdminTourResponse> findAll(String q, String country, String status,
                                                   int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<Tour> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<>();

            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("country")), pattern)
                ));
            }
            if (country != null && !country.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("country")), country.toLowerCase()));
            }
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), TourStatus.valueOf(status)));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return PageResponse.of(tourRepository.findAll(spec, pageable).map(this::toAdminResponse));
    }

    @Transactional
    public TourDetailResponse create(CreateTourRequest request) {
        Tour tour = Tour.builder()
                .title(request.title())
                .description(request.description())
                .country(request.country())
                .city(request.city())
                .hotelName(request.hotelName())
                .hotelStars(request.hotelStars())
                .mealType(request.mealType())
                .durationNights(request.durationNights())
                .priceFrom(request.priceFrom())
                .oldPrice(request.oldPrice())
                .badge(request.badge())
                .imageUrl(request.imageUrl())
                .galleryUrls(request.galleryUrls() != null
                        ? request.galleryUrls().toArray(new String[0]) : null)
                .status(TourStatus.ACTIVE)
                .reviewsCount(0)
                .build();

        Tour saved = tourRepository.save(tour);
        return buildDetail(saved);
    }

    @Transactional
    public TourDetailResponse update(Long id, UpdateTourRequest request) {
        Tour tour = findOrThrow(id);

        if (request.title()         != null) tour.setTitle(request.title());
        if (request.description()   != null) tour.setDescription(request.description());
        if (request.country()       != null) tour.setCountry(request.country());
        if (request.city()          != null) tour.setCity(request.city());
        if (request.hotelName()     != null) tour.setHotelName(request.hotelName());
        if (request.hotelStars()    != null) tour.setHotelStars(request.hotelStars());
        if (request.mealType()      != null) tour.setMealType(request.mealType());
        if (request.durationNights()!= null) tour.setDurationNights(request.durationNights());
        if (request.priceFrom()     != null) tour.setPriceFrom(request.priceFrom());
        if (request.oldPrice()      != null) tour.setOldPrice(request.oldPrice());
        if (request.badge()         != null) tour.setBadge(request.badge());
        if (request.imageUrl()      != null) tour.setImageUrl(request.imageUrl());
        if (request.galleryUrls()   != null) tour.setGalleryUrls(request.galleryUrls().toArray(new String[0]));

        return buildDetail(tour);
    }

    @Transactional
    public void archive(Long id) {
        Tour tour = findOrThrow(id);

        boolean hasActive = bookingRepository.existsByTourDateIdAndStatusIn(
                id,
                List.of(BookingStatus.NEW, BookingStatus.CONFIRMED, BookingStatus.PAID)
        );
        if (hasActive) {
            throw new BusinessException(
                    "Cannot archive tour with active bookings", HttpStatus.CONFLICT
            );
        }
        tour.setStatus(TourStatus.ARCHIVED);
    }

    @Transactional
    public TourDetailResponse addDate(Long tourId, CreateTourDateRequest request) {
        Tour tour = findOrThrow(tourId);

        TourDate date = TourDate.builder()
                .tour(tour)
                .departureDate(request.departureDate())
                .returnDate(request.returnDate())
                .departureCity(request.departureCity())
                .totalSeats(request.totalSeats())
                .availableSeats(request.totalSeats())
                .priceOverride(request.priceOverride())
                .build();

        tourDateRepository.save(date);
        return buildDetail(tour);
    }

    private AdminTourResponse toAdminResponse(Tour tour) {
        long activeDates = tourDateRepository
                .findByTourIdAndDepartureDateGreaterThanEqualOrderByDepartureDate(tour.getId(), LocalDate.now())
                .size();
        return new AdminTourResponse(
                tour.getId(), tour.getTitle(), tour.getCountry(), tour.getHotelName(),
                tour.getHotelStars(), tour.getMealType(), tour.getDurationNights(),
                tour.getPriceFrom(), tour.getBadge(), tour.getImageUrl(),
                tour.getStatus().name(), (int) activeDates, tour.getCreatedAt()
        );
    }

    private TourDetailResponse buildDetail(Tour tour) {
        var dates = tourDateRepository
                .findByTourIdAndDepartureDateGreaterThanEqualOrderByDepartureDate(tour.getId(), LocalDate.now())
                .stream().map(tourMapper::toDateResponse).toList();
        var base = tourMapper.toDetail(tour);
        return new TourDetailResponse(
                base.id(), base.title(), base.description(), base.country(), base.city(),
                base.hotelName(), base.hotelStars(), base.mealType(), base.durationNights(),
                base.priceFrom(), base.oldPrice(), base.badge(), base.rating(), base.reviewsCount(),
                base.imageUrl(), base.galleryUrls(), base.status(), dates, List.of()
        );
    }

    private Tour findOrThrow(Long id) {
        return tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", id));
    }
}
