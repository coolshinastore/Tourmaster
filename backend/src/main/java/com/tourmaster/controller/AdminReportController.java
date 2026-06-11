package com.tourmaster.controller;

import com.tourmaster.dto.response.SalesReportResponse;
import com.tourmaster.entity.Booking;
import com.tourmaster.entity.BookingStatus;
import com.tourmaster.repository.BookingRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Admin — Reports", description = "Звіти та аналітика")
public class AdminReportController {

    private final BookingRepository bookingRepository;

    @GetMapping("/sales")
    @Operation(summary = "Звіт по продажах за період")
    public SalesReportResponse getSales(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        List<Booking> bookings = bookingRepository.findAll((root, query, cb) ->
                cb.between(
                        cb.function("DATE", LocalDate.class, root.get("createdAt")),
                        from, to
                )
        );

        BigDecimal totalRevenue = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PAID || b.getStatus() == BookingStatus.COMPLETED)
                .map(b -> b.getTotalPrice().subtract(b.getDiscount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<BookingStatus, Long> byStatus = bookings.stream()
                .collect(Collectors.groupingBy(Booking::getStatus, Collectors.counting()));

        // Daily revenue
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<SalesReportResponse.DailyRevenue> dailyRevenue = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PAID || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                        b -> b.getCreatedAt().toLocalDate().format(fmt),
                        Collectors.toList()
                ))
                .entrySet().stream()
                .map(e -> new SalesReportResponse.DailyRevenue(
                        e.getKey(),
                        e.getValue().stream().map(b -> b.getTotalPrice().subtract(b.getDiscount()))
                                .reduce(BigDecimal.ZERO, BigDecimal::add),
                        e.getValue().size()
                ))
                .sorted((a, b) -> a.date().compareTo(b.date()))
                .toList();

        // Top tours
        List<SalesReportResponse.TopTour> topTours = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PAID || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                        b -> b.getTourDate().getTour(),
                        Collectors.toList()
                ))
                .entrySet().stream()
                .map(e -> new SalesReportResponse.TopTour(
                        e.getKey().getId(),
                        e.getKey().getTitle(),
                        e.getValue().size(),
                        e.getValue().stream().map(b -> b.getTotalPrice().subtract(b.getDiscount()))
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .sorted((a, b) -> Long.compare(b.bookings(), a.bookings()))
                .limit(10)
                .toList();

        return new SalesReportResponse(
                totalRevenue,
                bookings.size(),
                byStatus.getOrDefault(BookingStatus.NEW, 0L),
                byStatus.getOrDefault(BookingStatus.CONFIRMED, 0L),
                byStatus.getOrDefault(BookingStatus.PAID, 0L),
                byStatus.getOrDefault(BookingStatus.COMPLETED, 0L),
                byStatus.getOrDefault(BookingStatus.CANCELLED, 0L),
                dailyRevenue,
                topTours
        );
    }
}
