package com.tourmaster.service;

import com.tourmaster.entity.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;

    @Async
    public void sendBookingStatusChanged(Booking booking) {
        String email = booking.getUser().getEmail();
        String status = booking.getStatus().name();
        String tourTitle = booking.getTourDate().getTour().getTitle();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("TourMaster: статус бронювання змінено");
            message.setText(buildStatusEmail(booking.getUser().getFirstName(), tourTitle, status));
            mailSender.send(message);
            log.info("Notification sent to {} for booking {}", email, booking.getId());
        } catch (Exception e) {
            log.error("Failed to send notification to {} for booking {}: {}",
                    email, booking.getId(), e.getMessage());
        }
    }

    private String buildStatusEmail(String name, String tourTitle, String status) {
        String statusUa = switch (status) {
            case "CONFIRMED"  -> "Підтверджено ✓";
            case "PAID"       -> "Оплачено ✓";
            case "COMPLETED"  -> "Завершено";
            case "CANCELLED"  -> "Скасовано";
            default           -> status;
        };
        return """
                Вітаємо, %s!

                Статус вашого бронювання «%s» змінено на: %s

                З повагою,
                Команда TourMaster
                """.formatted(name, tourTitle, statusUa);
    }
}
