package com.catalogue.controller;

import com.catalogue.dto.request.LoginRequest;
import com.catalogue.dto.request.RegisterRequest;
import com.catalogue.dto.request.TokenRefreshRequest;
import com.catalogue.dto.response.ApiResponse;
import com.catalogue.dto.response.AuthResponse;
import com.catalogue.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new enterprise and owner account")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ApiResponse.ok("Registration successful", authService.register(req));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT tokens")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok("Login successful", authService.login(req));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ApiResponse<AuthResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest req) {
        return ApiResponse.ok("Token refreshed", authService.refreshToken(req.getRefreshToken()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate refresh token")
    public ApiResponse<Void> logout(@Valid @RequestBody TokenRefreshRequest req) {
        authService.logout(req.getRefreshToken());
        return ApiResponse.ok("Logout successful", null);
    }
}
