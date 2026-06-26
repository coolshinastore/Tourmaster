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

@Slf4j
@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DemoDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail("client@tourmaster.ua")) {
            return;
        }

        userRepository.save(User.builder()
                .email("client@tourmaster.ua")
                .password(passwordEncoder.encode("Client@2025"))
                .firstName("Тест")
                .lastName("Клієнт")
                .phone("+380991234568")
                .role(Role.CLIENT)
                .loyaltyPoints(0)
                .build());

        log.info("Demo client created: client@tourmaster.ua / Client@2025");
    }
}
