/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CatalogueRequest {

    @NotBlank(message = "Catalogue name is required")
    @Size(max = 500)
    private String name;

    private String description;
    private Integer templateId;
    private Map<String, Object> layoutJson;
    private String pageSize = "A4";
    private String orientation = "PORTRAIT";
    private String coverImage;
    private List<CatalogueItemRequest> items;

    @Data
    public static class CatalogueItemRequest {
        private String itemId;
        private Integer pageNumber = 1;
        private Integer position = 0;
        private String customName;
        private java.math.BigDecimal customPrice;
        private String customDesc;
        private Map<String, Object> customOverrides;
    }
}
