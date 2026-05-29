/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class LookupRequest {
    @NotBlank @Size(max = 150)
    private String name;
    private String description;
    private Boolean isActive = true;
    private BigDecimal decimalValue;
    private List<String> sizeList;
}
