package com.tourmaster.repository;

import com.tourmaster.entity.TourDate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TourDateRepository extends JpaRepository<TourDate, Long> {
    List<TourDate> findByTourIdAndDepartureDateGreaterThanEqualOrderByDepartureDate(Long tourId, LocalDate from);
}
