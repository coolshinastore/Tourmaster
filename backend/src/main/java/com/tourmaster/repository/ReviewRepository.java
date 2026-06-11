package com.tourmaster.repository;

import com.tourmaster.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByTourId(Long tourId, Pageable pageable);
    boolean existsByUserIdAndBookingId(Long userId, Long bookingId);
}
