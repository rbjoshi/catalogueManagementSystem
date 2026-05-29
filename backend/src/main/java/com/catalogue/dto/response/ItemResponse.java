/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ItemResponse {
    private UUID itemId;
    private String entId;
    private String sku;
    private String name;
    private String description;
    private String shortDesc;
    private BigDecimal price;
    private BigDecimal mrp;
    private String currency;
    private BigDecimal discountPct;
    private LookupResponse itemType;
    private LookupResponse itemSubType;
    private SizeResponse itemSize;
    private LookupResponse itemBrand;
    private BigDecimal weight;
    private String weightUnit;
    private String dimensions;
    private String color;
    private String material;
    private String countryOrigin;
    private String barcode;
    private List<Map<String, Object>> images;
    private List<String> tags;
    private Map<String, Object> attributes;
    private Integer stockQty;
    private boolean isActive;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LookupResponse {
        private Integer id;
        private String name;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SizeResponse {
        private Integer id;
        private String label;
        private String unit;
    }
}
