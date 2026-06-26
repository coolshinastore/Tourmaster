package com.tourmaster.security;

import com.tourmaster.entity.Role;
import com.tourmaster.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JwtService")
class JwtServiceTest {

    private JwtService jwtService;

    // 32-символьний секрет (256 bit)
    private static final String SECRET = "test-secret-key-for-unit-tests!!";

    @BeforeEach
    void setup() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
        ReflectionTestUtils.setField(jwtService, "accessExpiration",  900_000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 604_800_000L);
    }

    private User user() {
        return User.builder()
                .id(1L)
                .email("ivan@test.com")
                .password("hashed")
                .firstName("Іван")
                .lastName("Петренко")
                .role(Role.CLIENT)
                .loyaltyPoints(0)
                .build();
    }

    @Test
    @DisplayName("згенерований access-токен є валідним для того самого користувача")
    void generateAndValidateAccessToken() {
        User u = user();
        String token = jwtService.generateAccessToken(u);

        assertThat(token).isNotBlank();
        assertThat(jwtService.isTokenValid(token, u)).isTrue();
    }

    @Test
    @DisplayName("згенерований refresh-токен є валідним")
    void generateAndValidateRefreshToken() {
        User u = user();
        String token = jwtService.generateRefreshToken(u);

        assertThat(jwtService.isTokenValid(token, u)).isTrue();
    }

    @Test
    @DisplayName("extractUsername повертає email користувача")
    void extractUsername() {
        User u = user();
        String token = jwtService.generateAccessToken(u);

        assertThat(jwtService.extractUsername(token)).isEqualTo("ivan@test.com");
    }

    @Test
    @DisplayName("токен іншого користувача — isTokenValid повертає false")
    void tokenBelongsToAnotherUser() {
        User u1 = user();
        User u2 = User.builder()
                .id(2L).email("other@test.com").password("h")
                .firstName("A").lastName("B").role(Role.CLIENT).loyaltyPoints(0).build();

        String tokenForU1 = jwtService.generateAccessToken(u1);

        assertThat(jwtService.isTokenValid(tokenForU1, u2)).isFalse();
    }

    @Test
    @DisplayName("прострочений токен — isTokenValid повертає false")
    void expiredToken() {
        JwtService shortLived = new JwtService();
        ReflectionTestUtils.setField(shortLived, "secret", SECRET);
        ReflectionTestUtils.setField(shortLived, "accessExpiration", -1L); // вже прострочений
        ReflectionTestUtils.setField(shortLived, "refreshExpiration", -1L);

        User u = user();
        String token = shortLived.generateAccessToken(u);

        assertThat(jwtService.isTokenValid(token, u)).isFalse();
    }
}
