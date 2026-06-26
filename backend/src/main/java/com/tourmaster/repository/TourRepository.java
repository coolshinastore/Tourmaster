package com.tourmaster.repository;

import com.tourmaster.dto.response.DestinationStatsResponse;
import com.tourmaster.entity.Tour;
import com.tourmaster.entity.TourStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface TourRepository extends JpaRepository<Tour, Long>, JpaSpecificationExecutor<Tour> {

    @Query("""
        SELECT NEW com.tourmaster.dto.response.DestinationStatsResponse(
            t.country, COUNT(t), MIN(t.priceFrom)
        )
        FROM Tour t
        WHERE t.status = com.tourmaster.entity.TourStatus.ACTIVE
        GROUP BY t.country
        ORDER BY COUNT(t) DESC
    """)
    List<DestinationStatsResponse> findDestinationStats();

    @Modifying
    @Query("""
        UPDATE Tour t SET
            t.rating = (SELECT COALESCE(AVG(CAST(r.rating AS double)), 0) FROM Review r WHERE r.tour = t),
            t.reviewsCount = (SELECT COUNT(r) FROM Review r WHERE r.tour = t)
        WHERE t.id = :tourId
    """)
    void recalculateRating(@Param("tourId") Long tourId);
}
