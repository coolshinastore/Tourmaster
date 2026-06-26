package com.tourmaster.config;

import com.tourmaster.entity.Role;
import com.tourmaster.entity.User;
import com.tourmaster.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String CLIENT_PASSWORD = "Client@2025";

    @Override
    public void run(ApplicationArguments args) {
        seedUsers();
    }

    private void seedUsers() {
        List<User> users = List.of(
            User.builder()
                .email("client@tourmaster.ua")
                .password(passwordEncoder.encode(CLIENT_PASSWORD))
                .firstName("Іван")
                .lastName("Петренко")
                .phone("+380991234568")
                .role(Role.CLIENT)
                .loyaltyPoints(0)
                .build(),
            User.builder()
                .email("anna@tourmaster.ua")
                .password(passwordEncoder.encode(CLIENT_PASSWORD))
                .firstName("Анна")
                .lastName("Коваленко")
                .phone("+380992345679")
                .role(Role.CLIENT)
                .loyaltyPoints(1240)
                .build(),
            User.builder()
                .email("mykola@tourmaster.ua")
                .password(passwordEncoder.encode(CLIENT_PASSWORD))
                .firstName("Микола")
                .lastName("Бондаренко")
                .phone("+380993456780")
                .role(Role.CLIENT)
                .loyaltyPoints(5800)
                .build(),
            User.builder()
                .email("olena@tourmaster.ua")
                .password(passwordEncoder.encode(CLIENT_PASSWORD))
                .firstName("Олена")
                .lastName("Шевченко")
                .phone("+380994567891")
                .role(Role.CLIENT)
                .loyaltyPoints(12500)
                .build()
        );

        int created = 0;
        for (User user : users) {
            if (!userRepository.existsByEmail(user.getEmail())) {
                userRepository.save(user);
                created++;
            }
        }

        if (created > 0) {
            log.info("DataSeeder: created {} demo user(s). Password for all clients: {}",
                    created, CLIENT_PASSWORD);
            log.info("  client@tourmaster.ua  — звичайний клієнт (0 балів)");
            log.info("  anna@tourmaster.ua    — срібний рівень (1240 балів)");
            log.info("  mykola@tourmaster.ua  — золотий рівень (5800 балів)");
            log.info("  olena@tourmaster.ua   — платиновий рівень (12500 балів)");
        }
    }
}
