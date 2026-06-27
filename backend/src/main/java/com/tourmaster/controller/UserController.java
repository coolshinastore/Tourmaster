package com.tourmaster.controller;

import com.tourmaster.dto.request.ChangePasswordRequest;
import com.tourmaster.dto.request.UpdateProfileRequest;
import com.tourmaster.dto.response.UserProfileResponse;
import com.tourmaster.entity.User;
import com.tourmaster.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Профіль користувача")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Отримати профіль поточного користувача")
    public UserProfileResponse getProfile(@AuthenticationPrincipal User user) {
        return userService.getProfile(user);
    }

    @PutMapping("/me")
    @Operation(summary = "Оновити профіль (ім'я, прізвище, телефон)")
    public UserProfileResponse updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return userService.updateProfile(user, request);
    }

    @PatchMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Змінити пароль")
    public void changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(user, request);
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Видалити акаунт (незворотня дія)")
    public void deleteAccount(@AuthenticationPrincipal User user) {
        userService.deleteAccount(user);
    }
}
