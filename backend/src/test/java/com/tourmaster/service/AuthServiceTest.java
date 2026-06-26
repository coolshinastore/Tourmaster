package com.tourmaster.service;

import com.tourmaster.dto.request.LoginRequest;
import com.tourmaster.dto.request.RefreshRequest;
import com.tourmaster.dto.request.RegisterRequest;
import com.tourmaster.dto.response.AuthResponse;
import com.tourmaster.entity.RefreshToken;
import com.tourmaster.entity.Role;
import com.tourmaster.entity.User;
import com.tourmaster.exception.EmailAlreadyExistsException;
import com.tourmaster.exception.InvalidTokenException;
import com.tourmaster.repository.RefreshTokenRepository;
import com.tourmaster.repository.UserRepository;
import com.tourmaster.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock JwtService jwtService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;

    @InjectMocks AuthService authService;

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(authService, "refreshExpiration", 604800000L);
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private User stubUser(Long id) {
        return User.builder()
                .id(id)
                .email("ivan@test.com")
                .password("hashed")
                .firstName("Іван")
                .lastName("Петренко")
                .role(Role.CLIENT)
                .loyaltyPoints(0)
                .build();
    }

    private void stubTokenGeneration(User user) {
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");
        when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    // ─── register ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("register")
    class Register {

        @Test
        @DisplayName("успішна реєстрація повертає токени")
        void success() {
            RegisterRequest req = new RegisterRequest("ivan@test.com", "pass123", "Іван", "Петренко", null);
            User saved = stubUser(1L);

            when(userRepository.existsByEmail(req.email())).thenReturn(false);
            when(passwordEncoder.encode(req.password())).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenReturn(saved);
            stubTokenGeneration(saved);

            AuthResponse resp = authService.register(req);

            assertThat(resp.accessToken()).isEqualTo("access-token");
            assertThat(resp.refreshToken()).isEqualTo("refresh-token");
            assertThat(resp.email()).isEqualTo("ivan@test.com");
            assertThat(resp.role()).isEqualTo(Role.CLIENT);

            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertThat(captor.getValue().getEmail()).isEqualTo("ivan@test.com");
        }

        @Test
        @DisplayName("дублікат email кидає EmailAlreadyExistsException")
        void duplicateEmail() {
            RegisterRequest req = new RegisterRequest("ivan@test.com", "pass", "А", "Б", null);
            when(userRepository.existsByEmail(req.email())).thenReturn(true);

            assertThatThrownBy(() -> authService.register(req))
                    .isInstanceOf(EmailAlreadyExistsException.class)
                    .hasMessageContaining("ivan@test.com");

            verify(userRepository, never()).save(any());
        }
    }

    // ─── login ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("успішний логін повертає токени та чистить старі refresh")
        void success() {
            LoginRequest req = new LoginRequest("ivan@test.com", "pass123");
            User user = stubUser(1L);

            when(userRepository.findByEmail(req.email())).thenReturn(Optional.of(user));
            stubTokenGeneration(user);

            AuthResponse resp = authService.login(req);

            verify(authenticationManager).authenticate(any());
            verify(refreshTokenRepository).deleteAllByUser(user);
            assertThat(resp.accessToken()).isEqualTo("access-token");
        }
    }

    // ─── refresh ─────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("refresh")
    class Refresh {

        @Test
        @DisplayName("валідний refresh-токен видає нові токени")
        void validToken() {
            User user = stubUser(1L);
            RefreshToken stored = RefreshToken.builder()
                    .token("old-refresh")
                    .user(user)
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .build();

            when(refreshTokenRepository.findByToken("old-refresh")).thenReturn(Optional.of(stored));
            stubTokenGeneration(user);

            AuthResponse resp = authService.refresh(new RefreshRequest("old-refresh"));

            verify(refreshTokenRepository).delete(stored);
            assertThat(resp.accessToken()).isEqualTo("access-token");
        }

        @Test
        @DisplayName("прострочений refresh-токен кидає InvalidTokenException")
        void expiredToken() {
            User user = stubUser(1L);
            RefreshToken expired = RefreshToken.builder()
                    .token("old-refresh")
                    .user(user)
                    .expiresAt(LocalDateTime.now().minusSeconds(1))
                    .build();

            when(refreshTokenRepository.findByToken("old-refresh")).thenReturn(Optional.of(expired));

            assertThatThrownBy(() -> authService.refresh(new RefreshRequest("old-refresh")))
                    .isInstanceOf(InvalidTokenException.class);

            verify(refreshTokenRepository).delete(expired);
        }

        @Test
        @DisplayName("невідомий токен кидає InvalidTokenException")
        void unknownToken() {
            when(refreshTokenRepository.findByToken("unknown")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.refresh(new RefreshRequest("unknown")))
                    .isInstanceOf(InvalidTokenException.class);
        }
    }

    // ─── logout ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("logout видаляє всі refresh-токени користувача")
    void logout() {
        User user = stubUser(1L);
        authService.logout(user);
        verify(refreshTokenRepository).deleteAllByUser(user);
    }
}
