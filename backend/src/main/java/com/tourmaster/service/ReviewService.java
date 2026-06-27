package com.tourmaster.service;

import com.tourmaster.dto.request.CreateReviewRequest;
import com.tourmaster.dto.response.ReviewResponse;
import com.tourmaster.entity.BookingStatus;
import com.tourmaster.entity.Review;
import com.tourmaster.entity.User;
import com.tourmaster.mapper.TourMapper;
import com.tourmaster.repository.BookingRepository;
import com.tourmaster.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final TourMapper tourMapper;

    public ReviewResponse createReview(User user, CreateReviewRequest request) {
        var booking = bookingRepository.findByIdWithDetails(request.bookingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Бронювання не знайдено"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Немає доступу до цього бронювання");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Відгук можна залишити лише після завершення туру");
        }

        if (reviewRepository.existsByUserIdAndBookingId(user.getId(), request.bookingId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ви вже залишили відгук для цього бронювання");
        }

        Review review = Review.builder()
                .user(user)
                .tour(booking.getTourDate().getTour())
                .booking(booking)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        return tourMapper.toReviewResponse(reviewRepository.save(review));
    }
}
