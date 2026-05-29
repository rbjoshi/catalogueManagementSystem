/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class ItemRequest {

    @Size(max = 100)
    private String sku;

    @NotBlank(message = "Item name is required")
    @Size(max = 500)
    private String name;

    private String description;
    private String shortDesc;
    private BigDecimal price;
    private BigDecimal mrp;
    private String currency = "INR";
    private BigDecimal discountPct;
    private Integer typeId;
    private Integer subTypeId;
    private Integer sizeId;
    private Integer brandId;
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
    private Boolean isActive = true;
}
