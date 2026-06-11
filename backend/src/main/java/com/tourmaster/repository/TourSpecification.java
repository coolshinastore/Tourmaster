package com.tourmaster.repository;

import com.tourmaster.entity.Tour;
import com.tourmaster.entity.TourDate;
import com.tourmaster.entity.TourStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TourSpecification {

    public static Specification<Tour> filter(
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
            String badge
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only active tours
            predicates.add(cb.equal(root.get("status"), TourStatus.ACTIVE));

            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("country")), pattern),
                        cb.like(cb.lower(root.get("hotelName")), pattern)
                ));
            }

            if (country != null && !country.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("country")), country.toLowerCase()));
            }

            if (priceMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("priceFrom"), priceMin));
            }

            if (priceMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("priceFrom"), priceMax));
            }

            if (stars != null && !stars.isEmpty()) {
                predicates.add(root.get("hotelStars").in(stars));
            }

            if (mealTypes != null && !mealTypes.isEmpty()) {
                predicates.add(root.get("mealType").in(mealTypes));
            }

            if (durationMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("durationNights"), durationMin));
            }

            if (durationMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("durationNights"), durationMax));
            }

            if (badge != null && !badge.isBlank()) {
                predicates.add(cb.equal(root.get("badge"), badge));
            }

            // Filter by departure date via tour_dates subquery
            if (departureDateFrom != null || departureDateTo != null) {
                Subquery<Long> sub = query.subquery(Long.class);
                Root<TourDate> td = sub.from(TourDate.class);
                List<Predicate> datePreds = new ArrayList<>();
                datePreds.add(cb.equal(td.get("tour"), root));
                datePreds.add(cb.greaterThan(td.get("availableSeats"), 0));
                if (departureDateFrom != null) {
                    datePreds.add(cb.greaterThanOrEqualTo(td.get("departureDate"), departureDateFrom));
                }
                if (departureDateTo != null) {
                    datePreds.add(cb.lessThanOrEqualTo(td.get("departureDate"), departureDateTo));
                }
                sub.select(td.get("id")).where(datePreds.toArray(new Predicate[0]));
                predicates.add(cb.exists(sub));
            }

            // Avoid duplicate rows when joining
            if (query.getResultType() != Long.class) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
