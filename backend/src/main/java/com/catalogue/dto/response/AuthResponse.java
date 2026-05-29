/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserInfo user;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserInfo {
        private UUID userId;
        private String email;
        private String username;
        private String firstName;
        private String lastName;
        private String role;
        private String entId;
        private String companyName;
        private String logoUrl;
    }
}
