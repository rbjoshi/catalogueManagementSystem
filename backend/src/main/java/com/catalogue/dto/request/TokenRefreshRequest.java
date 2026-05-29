/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class TokenRefreshRequest {
    @NotBlank
    private String refreshToken;
}
