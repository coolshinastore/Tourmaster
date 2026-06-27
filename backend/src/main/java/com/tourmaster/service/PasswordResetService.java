package com.tourmaster.service;

import com.tourmaster.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Setter
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${frontend.url:http://localhost:4200}")
    private String frontendUrl;

    private record TokenEntry(String email, Instant expiresAt) {}

    private final Map<String, TokenEntry> tokens = new ConcurrentHashMap<>();

    private static final long TOKEN_TTL_MINUTES = 30;

    public void requestReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            tokens.put(token, new TokenEntry(email, Instant.now().plusSeconds(TOKEN_TTL_MINUTES * 60)));
            sendResetEmail(email, user.getFirstName(), token);
        });
        // always return success to prevent email enumeration
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        TokenEntry entry = tokens.get(token);
        if (entry == null || Instant.now().isAfter(entry.expiresAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Посилання недійсне або термін його дії закінчився. Запросіть нове.");
        }

        var user = userRepository.findByEmail(entry.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Користувача не знайдено"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokens.remove(token);
    }

    @Scheduled(fixedDelay = 1_800_000) // every 30 minutes
    public void purgeExpiredTokens() {
        Instant now = Instant.now();
        tokens.entrySet().removeIf(e -> now.isAfter(e.getValue().expiresAt()));
    }

    private void sendResetEmail(String to, String firstName, String token) {
        if (mailSender == null) {
            log.warn("Mail sender not configured — password reset link for {}: {}/auth/reset-password?token={}",
                    to, frontendUrl, token);
            return;
        }
        try {
            String link = frontendUrl + "/auth/reset-password?token=" + token;
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject("TourMaster — відновлення пароля");
            msg.setText(
                    "Вітаємо, " + firstName + "!\n\n" +
                    "Для скидання пароля перейдіть за посиланням:\n" + link + "\n\n" +
                    "Посилання дійсне " + TOKEN_TTL_MINUTES + " хвилин.\n\n" +
                    "Якщо ви не надсилали цей запит — просто проігноруйте лист.\n\n" +
                    "TourMaster"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }
}
