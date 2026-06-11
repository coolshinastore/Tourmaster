package com.tourmaster.mapper;

import com.tourmaster.dto.response.ReviewResponse;
import com.tourmaster.dto.response.TourDateResponse;
import com.tourmaster.dto.response.TourDetailResponse;
import com.tourmaster.dto.response.TourSummaryResponse;
import com.tourmaster.entity.Review;
import com.tourmaster.entity.Tour;
import com.tourmaster.entity.TourDate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface TourMapper {

    @Mapping(target = "status", expression = "java(tour.getStatus().name())")
    TourSummaryResponse toSummary(Tour tour);

    @Mapping(target = "status", expression = "java(tour.getStatus().name())")
    @Mapping(target = "galleryUrls", expression = "java(toList(tour.getGalleryUrls()))")
    @Mapping(target = "dates", ignore = true)
    @Mapping(target = "latestReviews", ignore = true)
    TourDetailResponse toDetail(Tour tour);

    @Mapping(target = "price", expression = "java(tourDate.getEffectivePrice())")
    TourDateResponse toDateResponse(TourDate tourDate);

    @Mapping(target = "authorFirstName", source = "user.firstName")
    @Mapping(target = "authorLastLetter", expression = "java(review.getUser().getLastName().substring(0, 1) + \".\")")
    ReviewResponse toReviewResponse(Review review);

    default List<String> toList(String[] arr) {
        return arr == null ? List.of() : Arrays.asList(arr);
    }
}
