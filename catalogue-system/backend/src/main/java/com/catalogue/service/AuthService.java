/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.service;

import com.catalogue.dto.request.LoginRequest;
import com.catalogue.dto.request.RegisterRequest;
import com.catalogue.dto.response.AuthResponse;
import com.catalogue.entity.Enterprise;
import com.catalogue.entity.RefreshToken;
import com.catalogue.entity.User;
import com.catalogue.exception.BadRequestException;
import com.catalogue.repository.EnterpriseRepository;
import com.catalogue.repository.RefreshTokenRepository;
import com.catalogue.repository.UserRepository;
import com.catalogue.security.JwtService;
import com.catalogue.util.EntIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final EnterpriseRepository enterpriseRepository;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        // Validate domain uniqueness
        if (req.getCompanyDomain() != null && enterpriseRepository.existsByDomain(req.getCompanyDomain())) {
            throw new BadRequestException("Company domain already registered");
        }

        // Generate ent_id: "e-" + 32 random alphanumeric chars
        String entId = EntIdGenerator.generate();

        Enterprise enterprise = Enterprise.builder()
                .entId(entId)
                .name(req.getCompanyName())
                .domain(req.getCompanyDomain())
                .email(req.getCompanyEmail())
                .phone(req.getCompanyPhone())
                .address(req.getCompanyAddress())
                .logoUrl(req.getCompanyLogoUrl())
                .plan(Enterprise.Plan.FREE)
                .build();

        enterprise = enterpriseRepository.save(enterprise);

        User owner = User.builder()
                .enterprise(enterprise)
                .username(req.getUsername())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .role(User.Role.OWNER)
                .build();

        owner = userRepository.save(owner);
        log.info("New enterprise registered: entId={}, company={}", entId, req.getCompanyName());

        return buildAuthResponse(owner, enterprise);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!user.isActive()) {
            throw new BadRequestException("Account is deactivated");
        }

        // Update last login
        user.setLastLogin(java.time.ZonedDateTime.now());
        userRepository.save(user);

        return buildAuthResponse(user, user.getEnterprise());
    }

    @Transactional
    public AuthResponse refreshToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> buildAuthResponse(user, user.getEnterprise()))
                .orElseThrow(() -> new BadRequestException("Refresh token is not in database!"));
    }

    @Transactional
    public void logout(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshTokenRepository::delete);
    }

    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(java.time.Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    private AuthResponse buildAuthResponse(User user, Enterprise enterprise) {
        String accessToken = jwtService.generateToken(
                user.getUserId(), user.getEmail(),
                enterprise.getEntId(), user.getRole().name());
        
        String refreshTokenStr = jwtService.generateRefreshToken(user.getEmail());
        
        // Remove old tokens and save new one
        refreshTokenRepository.deleteByUser(user);
        
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiryDate(java.time.Instant.now().plusMillis(refreshExpiration))
                .build();
        
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .user(AuthResponse.UserInfo.builder()
                        .userId(user.getUserId())
                        .email(user.getEmail())
                        .username(user.getUsername())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole().name())
                        .entId(enterprise.getEntId())
                        .companyName(enterprise.getName())
                        .logoUrl(enterprise.getLogoUrl())
                        .build())
                .build();
    }
}
