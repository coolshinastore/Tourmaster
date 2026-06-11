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
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpiration;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .role(Role.CLIENT)
                .loyaltyPoints(0)
                .build();

        user = userRepository.save(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        User user = userRepository.findByEmail(request.email()).orElseThrow();
        refreshTokenRepository.deleteAllByUser(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken stored = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(InvalidTokenException::new);

        if (stored.isExpired()) {
            refreshTokenRepository.delete(stored);
            throw new InvalidTokenException();
        }

        User user = stored.getUser();
        refreshTokenRepository.delete(stored);
        return issueTokens(user);
    }

    @Transactional
    public void logout(User user) {
        refreshTokenRepository.deleteAllByUser(user);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenValue)
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshTokenValue,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );
    }
}
