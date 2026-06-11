package com.tourmaster.mapper;

import com.tourmaster.dto.response.BookingDetailResponse;
import com.tourmaster.dto.response.BookingItemResponse;
import com.tourmaster.dto.response.BookingResponse;
import com.tourmaster.dto.response.ExtraServiceResponse;
import com.tourmaster.entity.Booking;
import com.tourmaster.entity.BookingItem;
import com.tourmaster.entity.ExtraService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    @Mapping(target = "tourId",        expression = "java(b.getTourDate().getTour().getId())")
    @Mapping(target = "tourTitle",     expression = "java(b.getTourDate().getTour().getTitle())")
    @Mapping(target = "country",       expression = "java(b.getTourDate().getTour().getCountry())")
    @Mapping(target = "imageUrl",      expression = "java(b.getTourDate().getTour().getImageUrl())")
    @Mapping(target = "durationNights",expression = "java(b.getTourDate().getTour().getDurationNights())")
    @Mapping(target = "departureDate", expression = "java(b.getTourDate().getDepartureDate())")
    @Mapping(target = "returnDate",    expression = "java(b.getTourDate().getReturnDate())")
    @Mapping(target = "departureCity", expression = "java(b.getTourDate().getDepartureCity())")
    @Mapping(target = "status",        expression = "java(b.getStatus().name())")
    @Mapping(target = "touristsCount", expression = "java(b.getItems().size())")
    BookingResponse toResponse(Booking b);

    @Mapping(target = "tourId",        expression = "java(b.getTourDate().getTour().getId())")
    @Mapping(target = "tourTitle",     expression = "java(b.getTourDate().getTour().getTitle())")
    @Mapping(target = "country",       expression = "java(b.getTourDate().getTour().getCountry())")
    @Mapping(target = "imageUrl",      expression = "java(b.getTourDate().getTour().getImageUrl())")
    @Mapping(target = "hotelStars",    expression = "java(b.getTourDate().getTour().getHotelStars())")
    @Mapping(target = "mealType",      expression = "java(b.getTourDate().getTour().getMealType())")
    @Mapping(target = "durationNights",expression = "java(b.getTourDate().getTour().getDurationNights())")
    @Mapping(target = "departureDate", expression = "java(b.getTourDate().getDepartureDate())")
    @Mapping(target = "returnDate",    expression = "java(b.getTourDate().getReturnDate())")
    @Mapping(target = "departureCity", expression = "java(b.getTourDate().getDepartureCity())")
    @Mapping(target = "status",        expression = "java(b.getStatus().name())")
    @Mapping(target = "tourists",      source = "items")
    @Mapping(target = "extraServices", expression = "java(b.getExtraServices().stream().map(this::toExtraServiceResponse).toList())")
    BookingDetailResponse toDetailResponse(Booking b);

    BookingItemResponse toItemResponse(BookingItem item);

    @Mapping(target = "type", expression = "java(s.getType().name())")
    ExtraServiceResponse toExtraServiceResponse(ExtraService s);
}
