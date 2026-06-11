package com.tourmaster.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record SalesReportResponse(
        BigDecimal totalRevenue,
        long totalBookings,
        long newBookings,
        long confirmedBookings,
        long paidBookings,
        long completedBookings,
        long cancelledBookings,
        List<DailyRevenue> dailyRevenue,
        List<TopTour> topTours
) {
    public record DailyRevenue(String date, BigDecimal revenue, long bookings) {}
    public record TopTour(Long tourId, String title, long bookings, BigDecimal revenue) {}
}
